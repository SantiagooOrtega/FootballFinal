const UserModel = require('../models/user.model');

const UserController = {
  /**
   * GET /api/users/profile
   * Perfil completo del usuario autenticado
   */
  async getProfile(req, res, next) {
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
   * PUT /api/users/profile
   * Actualizar perfil del usuario
   */
  async updateProfile(req, res, next) {
    try {
      const { username, avatar_url, favorite_team } = req.body;
      const updated = await UserModel.update(req.user.id, {
        username,
        avatar_url,
        favorite_team,
      });

      if (!updated) {
        return res.status(400).json({ error: 'No hay datos para actualizar.' });
      }

      res.json({ message: 'Perfil actualizado correctamente.', user: updated });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/users/leaderboard
   * Tabla de clasificación
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

module.exports = UserController;
