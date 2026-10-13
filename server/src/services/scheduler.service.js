const SyncService = require('./sync.service');
const AiService = require('./ai.service');

const HOUR_MS = 60 * 60 * 1000;
let running = false;

/** Sincroniza partidos reales y genera los pronósticos pendientes */
async function refresh() {
  if (running) return;
  running = true;
  try {
    const sync = await SyncService.run({ log: () => {} });
    const ai = await AiService.analyzePending({ log: () => {} });
    console.log('🔄 Sincronización automática:', { ...sync, ia: ai });
  } catch (error) {
    console.error('❌ Sincronización automática falló:', error.message);
  } finally {
    running = false;
  }
}

const SchedulerService = {
  start() {
    if (!process.env.FOOTBALL_DATA_API_KEY) {
      console.log('⏸️  Sincronización automática desactivada (falta FOOTBALL_DATA_API_KEY)');
      return;
    }
    const hours = Number(process.env.SYNC_INTERVAL_HOURS) || 6;
    setInterval(refresh, hours * HOUR_MS);
    console.log(`⏱️  Sincronización automática cada ${hours} h`);
  },
};

module.exports = SchedulerService;
