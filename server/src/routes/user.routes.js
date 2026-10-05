const { Router } = require('express');
const { body } = require('express-validator');
const UserController = require('../controllers/user.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');

const router = Router();

router.use(authenticate);

router.get('/profile', UserController.getProfile);

router.put(
  '/profile',
  [
    body('username')
      .optional()
      .trim()
      .isLength({ min: 3, max: 50 }).withMessage('Username debe tener entre 3 y 50 caracteres'),
    body('avatar_url')
      .optional()
      .isURL().withMessage('URL de avatar inválida'),
    body('favorite_team')
      .optional()
      .trim()
      .isLength({ max: 100 }).withMessage('Nombre de equipo muy largo'),
  ],
  validate,
  UserController.updateProfile
);

router.get('/leaderboard', UserController.getLeaderboard);

module.exports = router;
