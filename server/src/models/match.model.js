const { query } = require('../database/db');

const MatchModel = {
  /**
   * Obtener partidos con info completa de equipos y liga
   */
  async findAll({ status, league_id, limit = 20, offset = 0, date, lang = 'es' } = {}) {
    let conditions = [];
    let values = [];
    let idx = 1;

    if (status) {
      conditions.push(`m.status = $${idx++}`);
      values.push(status);
    }
    if (league_id) {
      conditions.push(`m.league_id = $${idx++}`);
      values.push(league_id);
    }
    if (date) {
      conditions.push(`DATE(m.match_date) = $${idx++}`);
      values.push(date);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    values.push(limit, offset);

    const result = await query(
      `SELECT
         m.id, m.match_date, m.status, m.home_score, m.away_score,
         m.venue, m.round, m.ai_prediction, m.ai_confidence, m.ai_analysis, m.ai_analysis_en,
         ht.id as home_team_id, ht.name as home_team_name, ht.short_name as home_short,
         ht.logo_url as home_logo, ht.form as home_form,
         ht.wins as home_wins, ht.draws as home_draws, ht.losses as home_losses,
         at2.id as away_team_id, at2.name as away_team_name, at2.short_name as away_short,
         at2.logo_url as away_logo, at2.form as away_form,
         at2.wins as away_wins, at2.draws as away_draws, at2.losses as away_losses,
         l.id as league_id, l.name as league_name, l.country as league_country,
         l.logo_url as league_logo
       FROM matches m
       JOIN teams ht ON m.home_team_id = ht.id
       JOIN teams at2 ON m.away_team_id = at2.id
       JOIN leagues l ON m.league_id = l.id
       ${where}
       ORDER BY m.match_date ASC
       LIMIT $${idx++} OFFSET $${idx}`,
      values
    );
    return result.rows.map((row) => formatMatch(row, lang));
  },

  /**
   * Obtener un partido por ID con predicción del usuario si está autenticado
   */
  async findById(id, userId = null, lang = 'es') {
    const result = await query(
      `SELECT
         m.id, m.match_date, m.status, m.home_score, m.away_score,
         m.venue, m.round, m.ai_prediction, m.ai_confidence, m.ai_analysis, m.ai_analysis_en,
         ht.id as home_team_id, ht.name as home_team_name, ht.short_name as home_short,
         ht.logo_url as home_logo, ht.form as home_form,
         ht.wins as home_wins, ht.draws as home_draws, ht.losses as home_losses,
         ht.goals_for as home_goals_for, ht.goals_against as home_goals_against,
         at2.id as away_team_id, at2.name as away_team_name, at2.short_name as away_short,
         at2.logo_url as away_logo, at2.form as away_form,
         at2.wins as away_wins, at2.draws as away_draws, at2.losses as away_losses,
         at2.goals_for as away_goals_for, at2.goals_against as away_goals_against,
         l.id as league_id, l.name as league_name, l.country as league_country, l.logo_url as league_logo
       FROM matches m
       JOIN teams ht ON m.home_team_id = ht.id
       JOIN teams at2 ON m.away_team_id = at2.id
       JOIN leagues l ON m.league_id = l.id
       WHERE m.id = $1`,
      [id]
    );

    if (result.rows.length === 0) return null;

    const match = formatMatch(result.rows[0], lang);

    // Adjuntar predicción del usuario si está autenticado
    if (userId) {
      const predResult = await query(
        'SELECT prediction, confidence FROM predictions WHERE user_id = $1 AND match_id = $2',
        [userId, id]
      );
      match.user_prediction = predResult.rows[0] || null;
    }

    return match;
  },

  /**
   * Obtener partidos de hoy
   */
  async getTodayMatches() {
    const result = await query(
      `SELECT
         m.id, m.match_date, m.status, m.home_score, m.away_score,
         m.venue, m.ai_prediction, m.ai_confidence,
         ht.name as home_team_name, ht.short_name as home_short, ht.logo_url as home_logo, ht.form as home_form,
         at2.name as away_team_name, at2.short_name as away_short, at2.logo_url as away_logo, at2.form as away_form,
         l.name as league_name, l.logo_url as league_logo, l.country as league_country
       FROM matches m
       JOIN teams ht ON m.home_team_id = ht.id
       JOIN teams at2 ON m.away_team_id = at2.id
       JOIN leagues l ON m.league_id = l.id
       WHERE DATE(m.match_date AT TIME ZONE 'UTC') = CURRENT_DATE
          OR DATE(m.match_date AT TIME ZONE 'UTC') = CURRENT_DATE + 1
       ORDER BY m.match_date ASC`
    );
    return result.rows.map(formatMatch);
  },

  /**
   * Actualizar resultado de un partido (solo admin)
   */
  async updateResult(id, { home_score, away_score, status }) {
    const result = await query(
      `UPDATE matches SET home_score = $1, away_score = $2, status = $3, updated_at = NOW()
       WHERE id = $4 RETURNING *`,
      [home_score, away_score, status, id]
    );
    return result.rows[0];
  },

  /**
   * Próximos partidos que todavía no tienen pronóstico de la IA,
   * con las estadísticas de ambos equipos para el análisis
   */
  async findNeedingAnalysis(limit = 40) {
    const result = await query(
      `SELECT m.id, m.match_date, l.name AS league,
              ht.name AS home_name, ht.wins AS home_wins, ht.draws AS home_draws,
              ht.losses AS home_losses, ht.goals_for AS home_gf,
              ht.goals_against AS home_ga, ht.form AS home_form,
              at2.name AS away_name, at2.wins AS away_wins, at2.draws AS away_draws,
              at2.losses AS away_losses, at2.goals_for AS away_gf,
              at2.goals_against AS away_ga, at2.form AS away_form
       FROM matches m
       JOIN teams ht ON m.home_team_id = ht.id
       JOIN teams at2 ON m.away_team_id = at2.id
       JOIN leagues l ON m.league_id = l.id
       WHERE m.status = 'scheduled' AND m.match_date > NOW()
         AND m.ai_prediction IS NULL
       ORDER BY m.match_date ASC
       LIMIT $1`,
      [limit]
    );
    return result.rows;
  },

  async saveAnalysis(id, { prediction, confidence, analysis, analysis_en }) {
    await query(
      `UPDATE matches
       SET ai_prediction = $1, ai_confidence = $2, ai_analysis = $3,
           ai_analysis_en = $4, updated_at = NOW()
       WHERE id = $5`,
      [prediction, confidence, analysis, analysis_en, id]
    );
  },

  /** Análisis ya generados en español que todavía no tienen versión en inglés */
  async findNeedingTranslation(limit = 30) {
    const result = await query(
      `SELECT id, ai_analysis FROM matches
       WHERE ai_analysis IS NOT NULL AND ai_analysis_en IS NULL
       ORDER BY match_date DESC
       LIMIT $1`,
      [limit]
    );
    return result.rows;
  },

  async saveTranslation(id, analysis_en) {
    await query('UPDATE matches SET ai_analysis_en = $1 WHERE id = $2', [analysis_en, id]);
  },

  /**
   * Estadísticas globales
   */
  async getStats() {
    const result = await query(
      `SELECT
         COUNT(*) as total_matches,
         COUNT(*) FILTER (WHERE status = 'finished') as finished,
         COUNT(*) FILTER (WHERE status = 'scheduled') as scheduled,
         COUNT(*) FILTER (WHERE status = 'live') as live
       FROM matches`
    );
    return result.rows[0];
  },
};

/**
 * Formatea la fila plana de la DB en objeto estructurado
 */
function formatMatch(row, lang = 'es') {
  return {
    id: row.id,
    match_date: row.match_date,
    status: row.status,
    venue: row.venue,
    round: row.round,
    home_team: {
      id: row.home_team_id,
      name: row.home_team_name,
      short_name: row.home_short,
      logo: row.home_logo,
      form: row.home_form,
      stats: {
        wins: row.home_wins,
        draws: row.home_draws,
        losses: row.home_losses,
        goals_for: row.home_goals_for,
        goals_against: row.home_goals_against,
      },
    },
    away_team: {
      id: row.away_team_id,
      name: row.away_team_name,
      short_name: row.away_short,
      logo: row.away_logo,
      form: row.away_form,
      stats: {
        wins: row.away_wins,
        draws: row.away_draws,
        losses: row.away_losses,
        goals_for: row.away_goals_for,
        goals_against: row.away_goals_against,
      },
    },
    score: row.status === 'finished'
      ? { home: row.home_score, away: row.away_score }
      : null,
    league: {
      id: row.league_id,
      name: row.league_name,
      country: row.league_country,
      logo: row.league_logo,
    },
    ai: {
      prediction: row.ai_prediction,
      confidence: row.ai_confidence,
      analysis: lang === 'en' && row.ai_analysis_en ? row.ai_analysis_en : row.ai_analysis,
    },
    user_prediction: row.user_prediction || null,
  };
}

module.exports = MatchModel;
