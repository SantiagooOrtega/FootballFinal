const MatchModel = require('../models/match.model');

const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models';
const BATCH_SIZE = 6;
const MIN_INTERVAL_MS = 7000;
const MAX_ATTEMPTS = 4;
const RETRYABLE = [429, 500, 503];

let lastRequestAt = 0;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const RESPONSE_SCHEMA = {
  type: 'ARRAY',
  items: {
    type: 'OBJECT',
    properties: {
      id: { type: 'STRING' },
      prediction: { type: 'STRING', enum: ['home', 'draw', 'away'] },
      confidence: { type: 'INTEGER' },
      analysis: { type: 'STRING' },
    },
    required: ['id', 'prediction', 'confidence', 'analysis'],
  },
};

const describeTeam = (name, t) =>
  `${name}: ${t.wins}V ${t.draws}E ${t.losses}D, goles ${t.gf} a favor y ${t.ga} en contra, ` +
  `racha reciente ${t.form || 'sin datos'}`;

function buildPrompt(matches) {
  const blocks = matches.map((m) => {
    const home = { wins: m.home_wins, draws: m.home_draws, losses: m.home_losses, gf: m.home_gf, ga: m.home_ga, form: m.home_form };
    const away = { wins: m.away_wins, draws: m.away_draws, losses: m.away_losses, gf: m.away_gf, ga: m.away_ga, form: m.away_form };
    return [
      `id: ${m.id}`,
      `Competición: ${m.league}`,
      `Local - ${describeTeam(m.home_name, home)}`,
      `Visitante - ${describeTeam(m.away_name, away)}`,
    ].join('\n');
  });

  return [
    'Eres un analista de fútbol. Para cada partido pronostica el resultado a 90 minutos',
    'usando únicamente las estadísticas de la temporada que se te dan (V=victorias, E=empates,',
    'D=derrotas; en la racha W=victoria, D=empate, L=derrota). El local tiene una pequeña ventaja.',
    '',
    'Para cada partido devuelve:',
    '- id: el mismo id recibido.',
    '- prediction: "home" (gana el local), "draw" (empate) o "away" (gana el visitante).',
    '- confidence: entero entre 35 y 90. Sé honesto: si el partido está parejo, usa valores bajos.',
    '- analysis: 2 o 3 frases en español que justifiquen el pronóstico con los datos dados.',
    '  No inventes lesiones, alineaciones ni resultados previos que no estén en los datos.',
    '',
    blocks.join('\n\n'),
  ].join('\n');
}

async function callGemini(prompt) {
  const model = process.env.GEMINI_MODEL || 'gemini-flash-latest';

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    const wait = lastRequestAt + MIN_INTERVAL_MS - Date.now();
    if (wait > 0) await sleep(wait);
    lastRequestAt = Date.now();

    const response = await fetch(`${API_URL}/${model}:generateContent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': process.env.GEMINI_API_KEY,
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.3,
          responseMimeType: 'application/json',
          responseSchema: RESPONSE_SCHEMA,
        },
      }),
    });

    if (response.ok) {
      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) throw new Error('Gemini no devolvió contenido');
      return JSON.parse(text);
    }

    if (RETRYABLE.includes(response.status) && attempt < MAX_ATTEMPTS) {
      await sleep(attempt * 8000);
      continue;
    }
    const detail = await response.text();
    throw new Error(`Gemini respondió ${response.status}: ${detail.slice(0, 160).replace(/\s+/g, ' ')}`);
  }
}

const AiService = {
  /** Genera y guarda el pronóstico de los próximos partidos que no lo tienen */
  async analyzePending({ log = console.log } = {}) {
    if (!process.env.GEMINI_API_KEY) {
      log('GEMINI_API_KEY no está configurada: se omite el análisis de la IA.');
      return { analyzed: 0, failed: 0 };
    }

    const pending = await MatchModel.findNeedingAnalysis();
    const summary = { analyzed: 0, failed: 0 };

    for (let i = 0; i < pending.length; i += BATCH_SIZE) {
      const batch = pending.slice(i, i + BATCH_SIZE);
      try {
        const results = await callGemini(buildPrompt(batch));
        const validIds = new Set(batch.map((m) => m.id));

        for (const r of results) {
          if (!validIds.has(r.id)) continue;
          await MatchModel.saveAnalysis(r.id, {
            prediction: r.prediction,
            confidence: Math.min(Math.max(r.confidence, 1), 99),
            analysis: r.analysis.trim(),
          });
          summary.analyzed += 1;
        }
        log(`IA: ${Math.min(i + BATCH_SIZE, pending.length)}/${pending.length} partidos analizados`);
      } catch (error) {
        summary.failed += batch.length;
        log(`IA: fallo en un lote (${error.message})`);
      }
    }

    return summary;
  },
};

module.exports = AiService;
