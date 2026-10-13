require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const { pool } = require('./db');
const SyncService = require('../services/sync.service');

SyncService.run()
  .then((summary) => {
    console.log('\nSincronización completada:', summary);
  })
  .catch((error) => {
    console.error('\nError en la sincronización:', error.message);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
