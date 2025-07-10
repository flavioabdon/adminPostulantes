const { Pool } = require('pg');
const md5 = require('md5');
const pool = new Pool(require('../config/database'));

class User {
  static async findByUsername(username) {
    try {
      const { rows } = await pool.query('SELECT * FROM usuarios WHERE username = $1', [username]);
      return rows[0];
    } catch (error) {
      console.error('Error en findByUsername:', error);
      throw error;
    }
  }

  static async getAll() {
    const { rows } = await pool.query('SELECT * FROM usuarios ORDER BY fecha_creacion DESC');
    return rows;
  }

  static async create(user) {
    const { username, email, password, rol } = user;
    const passwordHash = md5(password);
    const { rows } = await pool.query(
      'INSERT INTO usuarios (username, email, password_hash, rol) VALUES ($1, $2, $3, $4) RETURNING *',
      [username, email, passwordHash, rol]
    );
    return rows[0];
  }

  static async update(id, user) {
    const { username, email, rol, activo } = user;
    const { rows } = await pool.query(
      'UPDATE usuarios SET username = $1, email = $2, rol = $3, activo = $4, fecha_actualizacion = CURRENT_TIMESTAMP WHERE id = $5 RETURNING *',
      [username, email, rol, activo, id]
    );
    return rows[0];
  }

  static async delete(id) {
    await pool.query('DELETE FROM usuarios WHERE id = $1', [id]);
  }

  static async updatePassword(id, newPassword) {
    const passwordHash = md5(newPassword);
    await pool.query(
      'UPDATE usuarios SET password_hash = $1 WHERE id = $2',
      [passwordHash, id]
    );
  }
}

module.exports = User;