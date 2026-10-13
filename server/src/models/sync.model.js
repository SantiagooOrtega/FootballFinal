const { query } = require('../database/db');

const SyncModel = {
  async upsertLeague({ external_id, name, country, logo_url, season }) {
    const result = await query(
      `INSERT INTO leagues (external_id, name, country, logo_url, season)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (external_id)
       DO UPDATE SET name = $2, country = $3, logo_url = $4, season = $5, is_active = true
       RETURNING id`,
      [external_id, name, country, logo_url, season]
    );
    return result.rows[0].id;
  },

  /**
   * Los equipos de la Champions pertenecen a su liga local: league_id y
   * estadísticas solo se completan si todavía no tienen valor.
   */
  async upsertTeam({ external_id, name, short_name, logo_url, country, league_id, stats, form }) {
    const s = stats || {};
    const result = await query(
      `INSERT INTO teams (external_id, name, short_name, logo_url, country, league_id,
                          wins, draws, losses, goals_for, goals_against, form)
       VALUES ($1, $2, $3, $4, $5, $6, COALESCE($7, 0), COALESCE($8, 0), COALESCE($9, 0),
               COALESCE($10, 0), COALESCE($11, 0), $12)
       ON CONFLICT (external_id)
       DO UPDATE SET name = $2, short_name = $3, logo_url = $4,
                     country = COALESCE(teams.country, $5),
                     league_id = COALESCE(teams.league_id, $6),
                     wins = COALESCE($7, teams.wins),
                     draws = COALESCE($8, teams.draws),
                     losses = COALESCE($9, teams.losses),
                     goals_for = COALESCE($10, teams.goals_for),
                     goals_against = COALESCE($11, teams.goals_against),
                     form = COALESCE($12, teams.form)
       RETURNING id`,
      [
        external_id, name, short_name, logo_url, country, league_id,
        s.wins ?? null, s.draws ?? null, s.losses ?? null,
        s.goals_for ?? null, s.goals_against ?? null, form || null,
      ]
    );
    return result.rows[0].id;
  },

  /** Devuelve el id interno y si el partido acaba de terminar con este guardado */
  async upsertMatch({ external_id, league_id, home_team_id, away_team_id, match_date,
                      status, home_score, away_score, venue, round }) {
    const result = await query(
      `INSERT INTO matches (external_id, league_id, home_team_id, away_team_id, match_date,
                            status, home_score, away_score, venue, round)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       ON CONFLICT (external_id)
       DO UPDATE SET match_date = $5, status = $6, home_score = $7, away_score = $8,
                     venue = COALESCE($9, matches.venue), round = $10, updated_at = NOW()
       RETURNING id, status, (xmax = 0) AS inserted`,
      [external_id, league_id, home_team_id, away_team_id, match_date,
       status, home_score, away_score, venue, round]
    );
    return result.rows[0];
  },

  /** Partidos terminados cuyas predicciones de usuarios siguen sin resolver */
  async findUnresolvedFinished() {
    const result = await query(
      `SELECT DISTINCT m.id, m.home_score, m.away_score
       FROM matches m
       JOIN predictions p ON p.match_id = m.id
       WHERE m.status = 'finished' AND p.is_correct IS NULL
         AND m.home_score IS NOT NULL AND m.away_score IS NOT NULL`
    );
    return result.rows;
  },
};

module.exports = SyncModel;
