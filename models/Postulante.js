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

      // 3. Postulaciones agrupadas por CARGO
      const cargoRes = await query(`
        SELECT cargo_postulacion, COUNT(*) 
        FROM postulantes 
        GROUP BY cargo_postulacion
        ORDER BY COUNT(*) DESC
      `);

      // 4. Estadísticas de requisitos booleanos
      const requisitosRes = await query(`
        SELECT 
          COUNT(*) as total,
          COUNT(CASE WHEN es_boliviano THEN 1 END) as bolivianos,
          COUNT(CASE WHEN registrado_en_padron_electoral THEN 1 END) as en_padron,
          COUNT(CASE WHEN ci_vigente THEN 1 END) as ci_vigente,
          COUNT(CASE WHEN disponibilidad_tiempo_completo THEN 1 END) as tiempo_completo,
          COUNT(CASE WHEN linea_entel THEN 1 END) as linea_entel,
          COUNT(CASE WHEN ninguna_militancia_politica THEN 1 END) as sin_militancia,
          COUNT(CASE WHEN sin_conflictos_con_la_institucion THEN 1 END) as sin_conflictos,
          COUNT(CASE WHEN sin_sentencia_ejecutoriada THEN 1 END) as sin_sentencia,
          COUNT(CASE WHEN cuenta_con_celular_android THEN 1 END) as con_android,
          COUNT(CASE WHEN cuenta_con_powerbank THEN 1 END) as con_powerbank
        FROM postulantes
      `);

      // 5. Postulantes por ciudad
      const ciudadRes = await query(`
        SELECT ciudad, COUNT(*) 
        FROM postulantes 
        WHERE ciudad IS NOT NULL AND ciudad != ''
        GROUP BY ciudad 
        ORDER BY COUNT(*) DESC 
        LIMIT 10
      `);

      // 6. Postulantes por grado de instrucción
      const instruccionRes = await query(`
        SELECT grado_instruccion, COUNT(*) 
        FROM postulantes 
        WHERE grado_instruccion IS NOT NULL AND grado_instruccion != ''
        GROUP BY grado_instruccion 
        ORDER BY COUNT(*) DESC
      `);

      return {
        total,
        promedioHora,
        porCargo: cargoRes.rows,
        requisitos: requisitosRes.rows[0],
        porCiudad: ciudadRes.rows,
        porInstruccion: instruccionRes.rows,
        // Mantener compatibilidad con código existente
        porTipo: cargoRes.rows
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
      return postulantes.rows;
    } catch (error) {
      console.error('Error en Postulante.getByCI:', error);
      throw new Error('Error al obtener postulante por cédula de identidad');
    }
  }

  static async getByApellido(Apellido){
    try {
      const postulantes = await query( 'SELECT * FROM postulantes WHERE apellido_paterno ILIKE $1 OR apellido_materno ILIKE $1 ORDER BY fecha_registro DESC', [`%${Apellido}%`]);
      return postulantes.rows;
    } catch (error) {
      console.error('Error en Postulante.getByApellido:', error);
      throw new Error('Error al obtener postulantes por apellido');
    }
  }
}

module.exports = Postulante;