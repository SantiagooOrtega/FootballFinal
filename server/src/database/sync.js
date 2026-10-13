require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const { pool } = require('./db');
const SyncService = require('../services/sync.service');
const AiService = require('../services/ai.service');

SyncService.run()
  .then(async (summary) => {
    console.log('\nSincronización completada:', summary);
    const ai = await AiService.analyzePending();
    console.log('Análisis de la IA:', ai);
  })
  .catch((error) => {
    console.error('\nError en la sincronización:', error.message);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
