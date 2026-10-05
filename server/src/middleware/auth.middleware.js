const jwt = require('jsonwebtoken');
const { query } = require('../database/db');

/**
 * Middleware de autenticación JWT
 * Verifica el token en el header Authorization: Bearer <token>
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Acceso denegado. Token no proporcionado.',
        code: 'NO_TOKEN',
      });
    }

    const token = authHeader.split(' ')[1];

    // Verificar y decodificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Verificar que el usuario sigue activo en la DB
    const result = await query(
      'SELECT id, username, email, role, is_active FROM users WHERE id = $1',
      [decoded.id]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        error: 'Token inválido. Usuario no encontrado.',
        code: 'USER_NOT_FOUND',
      });
    }

    const user = result.rows[0];

    if (!user.is_active) {
      return res.status(401).json({
        error: 'Cuenta desactivada. Contacta al administrador.',
        code: 'ACCOUNT_DISABLED',
      });
    }

    // Adjuntar usuario a la request
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Token expirado. Inicia sesión nuevamente.',
        code: 'TOKEN_EXPIRED',
      });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Token inválido.',
        code: 'INVALID_TOKEN',
      });
    }
    next(error);
  }
};

/**
 * Middleware de autorización por rol
 * @param {...string} roles - Roles permitidos
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'No autenticado.' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'No tienes permisos para realizar esta acción.',
        code: 'FORBIDDEN',
        required: roles,
        current: req.user.role,
      });
    }

    next();
  };
};

module.exports = { authenticate, authorize };
