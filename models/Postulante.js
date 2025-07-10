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
      // 1. Total de postulantes
      const totalRes = await query('SELECT COUNT(*) FROM postulantes');
      const total = parseInt(totalRes.rows[0].count);

      // 2. Promedio de postulaciones por hora
      const avgRes = await query(`
        SELECT COUNT(*) / (EXTRACT(EPOCH FROM (MAX(fecha_registro) - MIN(fecha_registro)))/3600) as promedio_hora 
        FROM postulantes
      `);
      const promedioHora = parseFloat(avgRes.rows[0].promedio_hora || 0).toFixed(2);

      // 3. Postulaciones agrupadas por tipo
      const tipoRes = await query(`
        SELECT tipo_postulacion, COUNT(*) 
        FROM postulantes 
        GROUP BY tipo_postulacion
      `);

      return {
        total,
        promedioHora,
        porTipo: tipoRes.rows
      };
    } catch (error) {
      console.error('Error en Postulante.getStats:', error);
      throw new Error('Error al obtener estadísticas');
    }
  }
  static async getInscritosPorHora() {
    try {
      const result = await query(`
        SELECT 
          DATE_TRUNC('hour', fecha_registro) AS hora,
          COUNT(*) AS cantidad
        FROM postulantes
        GROUP BY hora
        ORDER BY hora ASC
      `);
      return result.rows;
    } catch (error) {
      console.error('Error en getInscritosPorHora:', error);
      throw new Error('Error al obtener datos por hora');
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