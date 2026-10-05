const PredictionModel = require('../models/prediction.model');
const MatchModel = require('../models/match.model');
const UserModel = require('../models/user.model');

const PredictionController = {
  /**
   * POST /api/predictions
   * Crear o actualizar predicción del usuario autenticado
   */
  async create(req, res, next) {
    try {
      const { match_id, prediction, confidence = 50 } = req.body;
      const user_id = req.user.id;

      // Verificar que el partido existe y no ha terminado
      const match = await MatchModel.findById(match_id);
      if (!match) {
        return res.status(404).json({ error: 'Partido no encontrado.' });
      }

      if (match.status === 'finished') {
        return res.status(400).json({
          error: 'No puedes predecir un partido que ya terminó.',
          code: 'MATCH_FINISHED',
        });
      }

      if (match.status === 'cancelled' || match.status === 'postponed') {
        return res.status(400).json({
          error: 'Este partido fue cancelado o pospuesto.',
          code: 'MATCH_UNAVAILABLE',
        });
      }

      const pred = await PredictionModel.upsert({
        user_id,
        match_id,
        prediction,
        confidence,
      });

      res.status(201).json({
        message: '¡Predicción guardada exitosamente!',
        prediction: pred,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/predictions/me
   * Historial de predicciones del usuario autenticado
   */
  async getMyPredictions(req, res, next) {
    try {
      const { limit = 20, offset = 0 } = req.query;
      const predictions = await PredictionModel.findByUser(req.user.id, {
        limit: parseInt(limit),
        offset: parseInt(offset),
      });
      const stats = await PredictionModel.getUserStats(req.user.id);

      res.json({ stats, predictions });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/predictions/match/:matchId
   * Predicción del usuario para un partido específico
   */
  async getForMatch(req, res, next) {
    try {
      const prediction = await PredictionModel.findOne(
        req.user.id,
        req.params.matchId
      );
      res.json({ prediction });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/predictions/leaderboard
   * Tabla de clasificación global
   */
  async getLeaderboard(req, res, next) {
    try {
      const { limit = 20 } = req.query;
      const leaderboard = await UserModel.getLeaderboard(parseInt(limit));
      res.json({ leaderboard });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = PredictionController;
