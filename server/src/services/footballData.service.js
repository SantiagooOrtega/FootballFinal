const BASE_URL = 'https://api.football-data.org/v4';

// Ligas incluidas en el plan gratuito de football-data.org
const COMPETITIONS = ['PL', 'PD', 'SA', 'BL1', 'CL'];

// El plan gratuito permite 10 peticiones por minuto
const MIN_INTERVAL_MS = 6500;
let lastRequestAt = 0;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function request(path) {
  const key = process.env.FOOTBALL_DATA_API_KEY;
  if (!key) throw new Error('Falta FOOTBALL_DATA_API_KEY en server/.env');

  const wait = lastRequestAt + MIN_INTERVAL_MS - Date.now();
  if (wait > 0) await sleep(wait);
  lastRequestAt = Date.now();

  const response = await fetch(`${BASE_URL}${path}`, { headers: { 'X-Auth-Token': key } });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`football-data.org respondió ${response.status}: ${detail.slice(0, 160)}`);
  }
  return response.json();
}

const FootballDataService = {
  competitions: COMPETITIONS,

  /** Todos los partidos de la temporada actual de una competición */
  async seasonMatches(code) {
    const data = await request(`/competitions/${code}/matches`);
    return data.matches;
  },

  /** Tabla de posiciones (victorias, empates, derrotas, goles) */
  async standings(code) {
    const data = await request(`/competitions/${code}/standings`);
    const total = data.standings.find((s) => s.type === 'TOTAL') || data.standings[0];
    return total ? total.table : [];
  },
};

module.exports = FootballDataService;
