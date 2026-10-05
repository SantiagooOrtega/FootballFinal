const { query } = require('../database/db');

const LeagueController = {
  /**
   * GET /api/leagues
   * Listar todas las ligas activas
   */
  async getAll(req, res, next) {
    try {
      const result = await query(
        'SELECT * FROM leagues WHERE is_active = true ORDER BY name ASC'
      );
      res.json({ leagues: result.rows });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/leagues/:id/teams
   * Equipos de una liga
   */
  async getTeams(req, res, next) {
    try {
      const result = await query(
        `SELECT t.*, 
                (t.wins * 3 + t.draws) as points,
                (t.wins + t.draws + t.losses) as played
         FROM teams t
         WHERE t.league_id = $1
         ORDER BY (t.wins * 3 + t.draws) DESC`,
        [req.params.id]
      );
      res.json({ teams: result.rows });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = LeagueController;
