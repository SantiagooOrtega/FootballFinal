const { query } = require('../database/db');
const bcrypt = require('bcryptjs');

const UserModel = {
  /**
   * Crear un nuevo usuario
   */
  async create({ username, email, password, favorite_team = null }) {
    const password_hash = await bcrypt.hash(password, 12);
    const result = await query(
      `INSERT INTO users (username, email, password_hash, favorite_team)
       VALUES ($1, $2, $3, $4)
       RETURNING id, username, email, favorite_team, avatar_url, points, accuracy, role, created_at`,
      [username, email, password_hash, favorite_team]
    );
    return result.rows[0];
  },

  /**
   * Buscar usuario por email (incluye hash para verificación)
   */
  async findByEmail(email) {
    const result = await query(
      'SELECT * FROM users WHERE email = $1 AND is_active = true',
      [email.toLowerCase()]
    );
    return result.rows[0] || null;
  },

  /**
   * Buscar usuario por ID (sin password_hash)
   */
  async findById(id) {
    const result = await query(
      `SELECT id, username, email, avatar_url, favorite_team, total_predictions,
              correct_predictions, accuracy, points, role, is_active, created_at, updated_at
       FROM users WHERE id = $1`,
      [id]
    );
    return result.rows[0] || null;
  },

  /**
   * Verificar si email o username ya existe
   */
  async exists({ email, username }) {
    const result = await query(
      'SELECT id FROM users WHERE email = $1 OR username = $2',
      [email.toLowerCase(), username]
    );
    return result.rows.length > 0;
  },

  /**
   * Actualizar perfil del usuario
   */
  async update(id, fields) {
    const allowed = ['username', 'avatar_url', 'favorite_team'];
    const updates = [];
    const values = [];
    let idx = 1;

    for (const key of allowed) {
      if (fields[key] !== undefined) {
        updates.push(`${key} = $${idx++}`);
        values.push(fields[key]);
      }
    }

    if (updates.length === 0) return null;

    updates.push(`updated_at = NOW()`);
    values.push(id);

    const result = await query(
      `UPDATE users SET ${updates.join(', ')}
       WHERE id = $${idx}
       RETURNING id, username, email, avatar_url, favorite_team, points, accuracy, role`,
      values
    );
    return result.rows[0];
  },

  /**
   * Verificar contraseña
   */
  async verifyPassword(plainPassword, hash) {
    return bcrypt.compare(plainPassword, hash);
  },

  /**
   * Actualizar estadísticas del usuario después de un pronóstico
   */
  async updateStats(userId) {
    await query(
      `UPDATE users SET
         total_predictions = (SELECT COUNT(*) FROM predictions WHERE user_id = $1),
         correct_predictions = (SELECT COUNT(*) FROM predictions WHERE user_id = $1 AND is_correct = true),
         accuracy = CASE
           WHEN (SELECT COUNT(*) FROM predictions WHERE user_id = $1) = 0 THEN 0
           ELSE ROUND(
             (SELECT COUNT(*) FROM predictions WHERE user_id = $1 AND is_correct = true)::DECIMAL /
             (SELECT COUNT(*) FROM predictions WHERE user_id = $1) * 100, 2
           )
         END,
         points = (SELECT COALESCE(SUM(points_earned), 0) FROM predictions WHERE user_id = $1),
         updated_at = NOW()
       WHERE id = $1`,
      [userId]
    );
  },

  /**
   * Top usuarios para el leaderboard
   */
  async getLeaderboard(limit = 20) {
    const result = await query(
      `SELECT id, username, avatar_url, favorite_team, points, total_predictions,
              correct_predictions, accuracy,
              RANK() OVER (ORDER BY points DESC, accuracy DESC) as rank
       FROM users
       WHERE is_active = true AND total_predictions > 0
       ORDER BY points DESC, accuracy DESC
       LIMIT $1`,
      [limit]
    );
    return result.rows;
  },
};

module.exports = UserModel;
