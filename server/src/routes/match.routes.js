const { Router } = require('express');
const { body, param, query } = require('express-validator');
const MatchController = require('../controllers/match.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');

const router = Router();

// ─── Rutas públicas ───────────────────────────────────────────────────────────
router.get('/', MatchController.getAll);
router.get('/today', MatchController.getToday);
router.get('/stats', MatchController.getStats);

// Ruta de detalle - opcional auth para ver predicción del usuario
router.get('/:id', (req, res, next) => {
  // Intenta autenticar pero no bloquea si no hay token
  const auth = require('../middleware/auth.middleware');
  const jwt = require('jsonwebtoken');
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      req.user = jwt.verify(token, process.env.JWT_SECRET);
    } catch (_) { /* token inválido, continuar sin auth */ }
  }
  next();
}, MatchController.getById);

// ─── Rutas protegidas (solo admin) ───────────────────────────────────────────
router.put(
  '/:id/result',
  authenticate,
  authorize('admin'),
  [
    param('id').isUUID().withMessage('ID de partido inválido'),
    body('home_score').isInt({ min: 0 }).withMessage('Marcador local inválido'),
    body('away_score').isInt({ min: 0 }).withMessage('Marcador visitante inválido'),
  ],
  validate,
  MatchController.updateResult
);

module.exports = router;
