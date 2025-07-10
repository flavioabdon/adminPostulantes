const { Pool } = require('pg');
const config = require('./database'); // Asegúrate que este archivo existe

const pool = new Pool(config);

// Verificación de conexión
pool.on('connect', () => console.log('PostgreSQL conectado'));
pool.on('error', err => console.error('Error en PostgreSQL:', err));

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool
};