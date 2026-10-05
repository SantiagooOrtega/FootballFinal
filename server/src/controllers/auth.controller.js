const jwt = require('jsonwebtoken');
const UserModel = require('../models/user.model');
const { createError } = require('../middleware/error.middleware');

/**
 * Genera un JWT firmado con el ID y rol del usuario
 */
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

const AuthController = {
  /**
   * POST /api/auth/register
   * Registro de nuevo usuario
   */
  async register(req, res, next) {
    try {
      const { username, email, password, favorite_team } = req.body;

      // Verificar si ya existe
      const exists = await UserModel.exists({ email, username });
      if (exists) {
        return res.status(409).json({
          error: 'El email o nombre de usuario ya está registrado.',
          code: 'ALREADY_EXISTS',
        });
      }

      const user = await UserModel.create({
        username,
        email: email.toLowerCase(),
        password,
        favorite_team,
      });

      const token = generateToken(user);

      res.status(201).json({
        message: '¡Registro exitoso! Bienvenido a Football Predictions.',
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          favorite_team: user.favorite_team,
          avatar_url: user.avatar_url,
          points: user.points,
          accuracy: user.accuracy,
          role: user.role,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/auth/login
   * Inicio de sesión con email y password
   */
  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      // Buscar usuario
      const user = await UserModel.findByEmail(email.toLowerCase());
      if (!user) {
        return res.status(401).json({
          error: 'Credenciales inválidas.',
          code: 'INVALID_CREDENTIALS',
        });
      }

      // Verificar contraseña
      const isValid = await UserModel.verifyPassword(password, user.password_hash);
      if (!isValid) {
        return res.status(401).json({
          error: 'Credenciales inválidas.',
          code: 'INVALID_CREDENTIALS',
        });
      }

      const token = generateToken(user);

      res.json({
        message: `¡Bienvenido de vuelta, ${user.username}!`,
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          favorite_team: user.favorite_team,
          avatar_url: user.avatar_url,
          points: user.points,
          accuracy: user.accuracy,
          total_predictions: user.total_predictions,
          correct_predictions: user.correct_predictions,
          role: user.role,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/auth/me
   * Obtener perfil del usuario autenticado
   */
  async me(req, res, next) {
    try {
      const user = await UserModel.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ error: 'Usuario no encontrado.' });
      }
      res.json({ user });
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/auth/logout
   * Logout (el cliente elimina el token)
   */
  logout(req, res) {
    res.json({ message: 'Sesión cerrada correctamente.' });
  },
};

module.exports = AuthController;
