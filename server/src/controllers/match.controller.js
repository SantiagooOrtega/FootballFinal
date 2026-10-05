const MatchModel = require('../models/match.model');
const PredictionModel = require('../models/prediction.model');
const UserModel = require('../models/user.model');

const MatchController = {
  /**
   * GET /api/matches
   * Listar partidos con filtros opcionales
   */
  async getAll(req, res, next) {
    try {
      const { status, league_id, date, limit = 20, offset = 0 } = req.query;
      const userId = req.user?.id || null;

      const matches = await MatchModel.findAll({
        status,
        league_id: league_id ? parseInt(league_id) : undefined,
        date,
        limit: parseInt(limit),
        offset: parseInt(offset),
      });

      res.json({
        total: matches.length,
        matches,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/matches/today
   * Partidos de hoy y mañana
   */
  async getToday(req, res, next) {
    try {
      const matches = await MatchModel.getTodayMatches();
      res.json({ total: matches.length, matches });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/matches/:id
   * Detalle de un partido con análisis de IA
   */
  async getById(req, res, next) {
    try {
      const userId = req.user?.id || null;
      const match = await MatchModel.findById(req.params.id, userId);

      if (!match) {
        return res.status(404).json({ error: 'Partido no encontrado.' });
      }

      res.json({ match });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/matches/stats
   * Estadísticas globales de partidos
   */
  async getStats(req, res, next) {
    try {
      const stats = await MatchModel.getStats();
      res.json({ stats });
    } catch (error) {
      next(error);
    }
  },

  /**
   * PUT /api/matches/:id/result  [Solo admin]
   * Actualizar resultado de un partido y resolver predicciones
   */
  async updateResult(req, res, next) {
    try {
      const { home_score, away_score } = req.body;
      const matchId = req.params.id;

      const match = await MatchModel.findById(matchId);
      if (!match) {
        return res.status(404).json({ error: 'Partido no encontrado.' });
      }

      // Actualizar resultado en DB
      const updated = await MatchModel.updateResult(matchId, {
        home_score,
        away_score,
        status: 'finished',
      });

      // Resolver predicciones de usuarios y actualizar sus estadísticas
      const affectedUsers = await PredictionModel.resolveForMatch(matchId, {
        home_score,
        away_score,
      });

      for (const userId of affectedUsers) {
        await UserModel.updateStats(userId);
      }

      res.json({
        message: `Resultado actualizado. ${affectedUsers.length} predicciones resueltas.`,
        match: updated,
      });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = MatchController;
