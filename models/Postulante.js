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

  static async getPaged(limit, offset) {

    const [postulantes, totalResult] = await Promise.all([
      query('SELECT * FROM postulantes ORDER BY fecha_registro DESC LIMIT $1 OFFSET $2', [limit, offset]),
      query('SELECT COUNT(*) from POSTULANTES')
    ])
    return {
      rows: postulantes.rows,
      count: parseInt(totalResult.rows[0].count)
    };
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

  static async getByCI(cedula_identidad) {
    try {
      const postulantes = await query( 'SELECT * FROM postulantes WHERE cedula_identidad = $1 ORDER BY fecha_registro DESC', [cedula_identidad]);
      return postulantes.rows; // Retorna el primer postulante encontrado
    } catch (error) {
      console.error('Error en Postulante.getByCI:', error);
      throw new Error('Error al obtener postulante por cédula de identidad');
    }
  }

  static async getByApellido(Apellido){
    try {
      const postulantes = await query( 'SELECT * FROM postulantes WHERE apellido_paterno ILIKE $1 OR apellido_materno ILIKE $1 ORDER BY fecha_registro DESC', [`%${Apellido}%`]);
      return postulantes.rows; // Retorna todos los postulantes que coincidan
    } catch (error) {
      console.error('Error en Postulante.getByApellido:', error);
      throw new Error('Error al obtener postulantes por apellido');
    }
  }
}

module.exports = Postulante;