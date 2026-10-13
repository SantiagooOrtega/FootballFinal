require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const { pool } = require('./db');
const AiService = require('../services/ai.service');

AiService.analyzePending()
  .then((summary) => console.log('\nAnálisis de la IA completado:', summary))
  .catch((error) => {
    console.error('\nError en el análisis:', error.message);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
