require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const { pool } = require('./db');

// Elimina los datos de ejemplo del seed (los reales siempre traen external_id)
const clean = async () => {
  const matches = await pool.query('DELETE FROM matches WHERE external_id IS NULL');
  const teams = await pool.query('DELETE FROM teams WHERE external_id IS NULL');
  const leagues = await pool.query(
    'DELETE FROM leagues l WHERE NOT EXISTS (SELECT 1 FROM teams t WHERE t.league_id = l.id)'
  );
  console.log(`Eliminados: ${matches.rowCount} partidos, ${teams.rowCount} equipos, ${leagues.rowCount} ligas de ejemplo`);
};

clean()
  .catch((error) => {
    console.error('Error al limpiar datos de ejemplo:', error.message);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
