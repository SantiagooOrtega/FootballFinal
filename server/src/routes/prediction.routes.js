const { Router } = require('express');
const { body, param } = require('express-validator');
const PredictionController = require('../controllers/prediction.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

router.post(
  '/',
  [
    body('match_id').isUUID().withMessage('ID de partido inválido'),
    body('prediction')
      .isIn(['home', 'draw', 'away'])
      .withMessage('Predicción debe ser: home, draw o away'),
    body('confidence')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('La confianza debe ser un número entre 1 y 100'),
  ],
  validate,
  PredictionController.create
);

router.get('/me', PredictionController.getMyPredictions);
router.get('/leaderboard', PredictionController.getLeaderboard);
router.get('/match/:matchId',
  [param('matchId').isUUID().withMessage('ID de partido inválido')],
  validate,
  PredictionController.getForMatch
);

module.exports = router;
