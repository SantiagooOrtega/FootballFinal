const FootballData = require('./footballData.service');
const SyncModel = require('../models/sync.model');
const PredictionModel = require('../models/prediction.model');
const UserModel = require('../models/user.model');

// Se guardan partidos recientes (para resultados) y de los próximos días
const DAYS_BACK = 3;
const DAYS_AHEAD = 10;
const DAY_MS = 24 * 60 * 60 * 1000;

const STATUS_MAP = {
  SCHEDULED: 'scheduled',
  TIMED: 'scheduled',
  IN_PLAY: 'live',
  PAUSED: 'live',
  FINISHED: 'finished',
  AWARDED: 'finished',
  POSTPONED: 'postponed',
  SUSPENDED: 'postponed',
  CANCELLED: 'cancelled',
};

const mapStatus = (status) => STATUS_MAP[status] || 'scheduled';

/** Racha de los últimos 5 partidos terminados por equipo: "WWDLW" */
function buildForm(finishedMatches) {
  const byTeam = new Map();
  const sorted = [...finishedMatches].sort((a, b) => new Date(a.utcDate) - new Date(b.utcDate));

  for (const m of sorted) {
    const { home, away } = m.score.fullTime;
    if (home === null || away === null) continue;
    const homeResult = home > away ? 'W' : home < away ? 'L' : 'D';
    const awayResult = home > away ? 'L' : home < away ? 'W' : 'D';
    byTeam.set(m.homeTeam.id, (byTeam.get(m.homeTeam.id) || '') + homeResult);
    byTeam.set(m.awayTeam.id, (byTeam.get(m.awayTeam.id) || '') + awayResult);
  }

  return new Map([...byTeam].map(([id, results]) => [id, results.slice(-5)]));
}

const SyncService = {
  async run({ log = console.log } = {}) {
    const from = Date.now() - DAYS_BACK * DAY_MS;
    const to = Date.now() + DAYS_AHEAD * DAY_MS;

    // 1. Descargar todo antes de escribir (respeta el límite de peticiones)
    const fetched = [];
    for (const code of FootballData.competitions) {
      log(`Descargando ${code}...`);
      const matches = await FootballData.seasonMatches(code);
      const table = code === 'CL' ? [] : await FootballData.standings(code);
      fetched.push({ code, matches, table });
    }

    const allFinished = fetched
      .flatMap((f) => f.matches)
      .filter((m) => mapStatus(m.status) === 'finished');
    const formByTeam = buildForm(allFinished);

    // 2. Guardar: ligas domésticas primero, la Champions al final
    const summary = { matches: 0, finished: 0, resolvedPredictions: 0 };
    const ordered = [...fetched].sort((a, b) => (a.code === 'CL') - (b.code === 'CL'));

    for (const { code, matches, table } of ordered) {
      const sample = matches[0];
      if (!sample) continue;

      const leagueId = await SyncModel.upsertLeague({
        external_id: sample.competition.id,
        name: sample.competition.name,
        country: sample.area.name,
        logo_url: sample.competition.emblem,
        season: new Date(sample.season.startDate).getFullYear(),
      });

      const statsByTeam = new Map(table.map((row) => [row.team.id, row]));
      const teamIds = new Map();
      const upsertTeam = async (team, area) => {
        if (teamIds.has(team.id)) return teamIds.get(team.id);
        const row = statsByTeam.get(team.id);
        const id = await SyncModel.upsertTeam({
          external_id: team.id,
          name: team.shortName || team.name,
          short_name: team.tla,
          logo_url: team.crest,
          country: area,
          league_id: leagueId,
          stats: row && {
            wins: row.won, draws: row.draw, losses: row.lost,
            goals_for: row.goalsFor, goals_against: row.goalsAgainst,
          },
          form: formByTeam.get(team.id),
        });
        teamIds.set(team.id, id);
        return id;
      };

      for (const m of matches) {
        const date = new Date(m.utcDate).getTime();
        if (date < from || date > to) continue;

        const status = mapStatus(m.status);
        const homeId = await upsertTeam(m.homeTeam, code === 'CL' ? null : m.area.name);
        const awayId = await upsertTeam(m.awayTeam, code === 'CL' ? null : m.area.name);
        const { home, away } = m.score.fullTime;

        await SyncModel.upsertMatch({
          external_id: m.id,
          league_id: leagueId,
          home_team_id: homeId,
          away_team_id: awayId,
          match_date: m.utcDate,
          status,
          home_score: status === 'finished' ? home : null,
          away_score: status === 'finished' ? away : null,
          venue: null,
          round: m.matchday ? `Jornada ${m.matchday}` : m.stage,
        });
        summary.matches += 1;
        if (status === 'finished') summary.finished += 1;
      }
      log(`${code}: guardado`);
    }

    // 3. Dar puntos a los usuarios por partidos que ya terminaron
    const unresolved = await SyncModel.findUnresolvedFinished();
    for (const match of unresolved) {
      const users = await PredictionModel.resolveForMatch(match.id, {
        home_score: match.home_score,
        away_score: match.away_score,
      });
      for (const userId of users) await UserModel.updateStats(userId);
      summary.resolvedPredictions += users.length;
    }

    return summary;
  },
};

module.exports = SyncService;
