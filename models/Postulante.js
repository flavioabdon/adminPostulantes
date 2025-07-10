const { query } = require('../config/db');

class Postulante {
  static async getAll() {
    try {
      const result = await query('SELECT * FROM postulantes ORDER BY fecha_registro DESC');
      return result.rows;
    } catch (error) {
      console.error('Error en Postulante.getAll:', error);
      throw new Error('Error al obtener postulantes');
    }
  }

  static async getStats() {
    try {
      const client = await pool.connect();
      try {
        // Total postulantes
        const totalRes = await client.query('SELECT COUNT(*) FROM postulantes');
        const total = parseInt(totalRes.rows[0].count);

        // Promedio por hora
        const avgRes = await client.query(`
          SELECT COUNT(*) / (EXTRACT(EPOCH FROM (MAX(fecha_registro) - MIN(fecha_registro)))/3600) as promedio_hora 
          FROM postulantes
        `);
        const promedioHora = parseFloat(avgRes.rows[0].promedio_hora).toFixed(2) || 0;

        // Postulaciones por tipo
        const tipoRes = await client.query(`
          SELECT tipo_postulacion, COUNT(*) 
          FROM postulantes 
          GROUP BY tipo_postulacion
        `);

        return {
          total,
          promedioHora,
          porTipo: tipoRes.rows
        };
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Error en Postulante.getStats:', error);
      throw new Error('Error al obtener estadísticas');
    }
  }

  static async getByIds(ids) {
    try {
      const result = await query('SELECT * FROM postulantes WHERE id = ANY($1)', [ids]);
      return result.rows;
    } catch (error) {
      console.error('Error en Postulante.getByIds:', error);
      throw new Error('Error al obtener postulantes seleccionados');
    }
  }
}

module.exports = Postulante;