const { query } = require('../database/db');

const PredictionModel = {
  /**
   * Crear o actualizar una predicción del usuario
   */
  async upsert({ user_id, match_id, prediction, confidence }) {
    const result = await query(
      `INSERT INTO predictions (user_id, match_id, prediction, confidence)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id, match_id)
       DO UPDATE SET prediction = $3, confidence = $4
       RETURNING *`,
      [user_id, match_id, prediction, confidence]
    );
    return result.rows[0];
  },

  /**
   * Obtener todas las predicciones de un usuario con detalles del partido
   */
  async findByUser(userId, { limit = 20, offset = 0 } = {}) {
    const result = await query(
      `SELECT
         p.id, p.prediction, p.confidence, p.is_correct, p.points_earned, p.created_at,
         m.id as match_id, m.match_date, m.status, m.home_score, m.away_score,
         m.ai_prediction, m.ai_confidence,
         ht.name as home_team_name, ht.logo_url as home_logo,
         at2.name as away_team_name, at2.logo_url as away_logo,
         l.name as league_name, l.logo_url as league_logo
       FROM predictions p
       JOIN matches m ON p.match_id = m.id
       JOIN teams ht ON m.home_team_id = ht.id
       JOIN teams at2 ON m.away_team_id = at2.id
       JOIN leagues l ON m.league_id = l.id
       WHERE p.user_id = $1
       ORDER BY p.created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );
    return result.rows;
  },

  /**
   * Obtener predicción específica de un usuario para un partido
   */
  async findOne(userId, matchId) {
    const result = await query(
      'SELECT * FROM predictions WHERE user_id = $1 AND match_id = $2',
      [userId, matchId]
    );
    return result.rows[0] || null;
  },

  /**
   * Resolver predicciones de un partido terminado
   * Calcula si cada predicción fue correcta y otorga puntos
   */
  async resolveForMatch(matchId, { home_score, away_score }) {
    // Determinar resultado real
    let result;
    if (home_score > away_score) result = 'home';
    else if (away_score > home_score) result = 'away';
    else result = 'draw';

    // Actualizar predicciones: correctas = 10 pts, incorrectas = 0
    await query(
      `UPDATE predictions
       SET is_correct = (prediction = $1),
           points_earned = CASE WHEN prediction = $1 THEN 10 ELSE 0 END
       WHERE match_id = $2`,
      [result, matchId]
    );

    // Obtener IDs de usuarios afectados para actualizar sus stats
    const usersResult = await query(
      'SELECT DISTINCT user_id FROM predictions WHERE match_id = $1',
      [matchId]
    );
    return usersResult.rows.map(r => r.user_id);
  },

  /**
   * Estadísticas de predicciones de un usuario
   */
  async getUserStats(userId) {
    const result = await query(
      `SELECT
         COUNT(*) as total,
         COUNT(*) FILTER (WHERE is_correct = true) as correct,
         COUNT(*) FILTER (WHERE is_correct = false) as incorrect,
         COUNT(*) FILTER (WHERE is_correct IS NULL) as pending,
         COALESCE(SUM(points_earned), 0) as total_points,
         ROUND(
           CASE WHEN COUNT(*) FILTER (WHERE is_correct IS NOT NULL) = 0 THEN 0
           ELSE COUNT(*) FILTER (WHERE is_correct = true)::DECIMAL /
                COUNT(*) FILTER (WHERE is_correct IS NOT NULL) * 100
           END, 2
         ) as accuracy
       FROM predictions
       WHERE user_id = $1`,
      [userId]
    );
    return result.rows[0];
  },
};

module.exports = PredictionModel;
