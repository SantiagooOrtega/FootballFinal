const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Supabase exige SSL en todos los entornos
  ssl: { rejectUnauthorized: false },
});

pool.on('connect', () => {
  console.log('✅ Conectado a PostgreSQL / Supabase');
});

pool.on('error', (err) => {
  console.error('❌ Error en la conexión a la base de datos:', err.message);
});

/**
 * Ejecuta una query con parámetros de forma segura (previene SQL injection)
 * @param {string} text - Query SQL
 * @param {Array} params - Parámetros
 */
const query = async (text, params) => {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    if (process.env.NODE_ENV === 'development') {
      console.log(`📊 Query ejecutada en ${duration}ms`);
    }
    return result;
  } catch (error) {
    console.error('❌ Error en query:', error.message);
    throw error;
  }
};

module.exports = { pool, query };
