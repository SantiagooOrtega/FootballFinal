// Servidor de datos de prueba para ver la app sin base de datos ni backend real.
// Imita las rutas de /server en el mismo puerto (5001). Uso: npm run mock
const http = require('node:http')

const PORT = 5001
const HOUR = 3600 * 1000
const at = (hours) => new Date(Date.now() + hours * HOUR).toISOString()
const logo = (kind, id) => `https://media.api-sports.io/football/${kind}/${id}.png`

const leagues = [
  { id: 1, name: 'La Liga', country: 'España', logo: logo('leagues', 140) },
  { id: 2, name: 'Premier League', country: 'Inglaterra', logo: logo('leagues', 39) },
  { id: 3, name: 'Serie A', country: 'Italia', logo: logo('leagues', 135) },
  { id: 4, name: 'Bundesliga', country: 'Alemania', logo: logo('leagues', 78) },
  { id: 5, name: 'UEFA Champions League', country: 'Europa', logo: logo('leagues', 2) },
]

const team = (id, name, short, apiId, form, w, d, l, gf, ga) => ({
  id, name, short_name: short, logo: logo('teams', apiId), form,
  stats: { wins: w, draws: d, losses: l, goals_for: gf, goals_against: ga },
})

const T = {
  rma: team(1, 'Real Madrid', 'RMA', 541, 'WWDWW', 12, 3, 2, 38, 18),
  bar: team(2, 'FC Barcelona', 'BAR', 529, 'WDWWL', 11, 4, 2, 35, 20),
  atm: team(3, 'Atlético Madrid', 'ATM', 530, 'LWWDW', 10, 3, 4, 28, 16),
  mci: team(4, 'Manchester City', 'MCI', 50, 'WWWWW', 13, 2, 2, 42, 15),
  ars: team(5, 'Arsenal', 'ARS', 42, 'WWDWW', 12, 3, 2, 38, 17),
  liv: team(6, 'Liverpool', 'LIV', 40, 'DWWWW', 11, 4, 2, 36, 19),
  int: team(7, 'Inter Milan', 'INT', 505, 'WWWWW', 13, 2, 1, 40, 14),
  mil: team(8, 'AC Milan', 'MIL', 489, 'WDWLW', 10, 4, 3, 32, 21),
  bay: team(9, 'Bayern Munich', 'BAY', 157, 'WWWWW', 14, 1, 1, 48, 12),
  bvb: team(10, 'Borussia Dortmund', 'BVB', 165, 'WLWDW', 10, 3, 4, 34, 25),
}

const match = (id, league, home, away, hours, status, score, venue, round, ai) => ({
  id, match_date: at(hours), status, venue, round,
  home_team: T[home], away_team: T[away], score,
  league: leagues[league - 1],
  ai: { prediction: ai[0], confidence: ai[1], analysis: ai[2] },
  user_prediction: null,
})

const matches = [
  match('m1', 1, 'rma', 'bar', 0.2, 'live', null, 'Santiago Bernabéu', 'Jornada 12',
    ['home', 78, 'El Madrid llega con mejor racha y marca más de 3 goles por partido en casa. El Barcelona sufre en defensa a balón parado.']),
  match('m2', 2, 'mci', 'ars', 5, 'scheduled', null, 'Etihad Stadium', 'Jornada 14',
    ['home', 64, 'City mantiene cinco victorias seguidas y el mejor ataque de la liga. Arsenal es sólido pero rinde menos como visitante.']),
  match('m3', 3, 'int', 'mil', 23, 'scheduled', null, 'San Siro', 'Jornada 13',
    ['draw', 52, 'Derby muy parejo: ambos equipos promedian menos de dos goles en enfrentamientos directos recientes.']),
  match('m4', 4, 'bay', 'bvb', 30, 'scheduled', null, 'Allianz Arena', 'Jornada 11',
    ['home', 83, 'Bayern es líder con 48 goles a favor y solo 12 en contra. Dortmund pierde consistencia fuera de casa.']),
  match('m5', 5, 'liv', 'rma', 52, 'scheduled', null, 'Anfield', 'Fase de liga',
    ['away', 58, 'El Madrid domina en Champions por experiencia. Liverpool mantiene gran ataque pero concede en transiciones.']),
  match('m6', 1, 'atm', 'bar', 76, 'scheduled', null, 'Metropolitano', 'Jornada 13',
    ['draw', 47, 'Atlético defiende en bloque bajo y el Barcelona necesita paciencia. Se espera un marcador corto.']),
  match('m7', 2, 'liv', 'mci', -30, 'finished', { home: 2, away: 2 }, 'Anfield', 'Jornada 13',
    ['draw', 55, 'Dos ataques sobresalientes con defensas vulnerables; la IA anticipaba un partido de ida y vuelta.']),
  match('m8', 3, 'mil', 'int', -78, 'finished', { home: 0, away: 1 }, 'San Siro', 'Jornada 12',
    ['away', 66, 'Inter llega con mejor forma y mayor solidez defensiva.']),
]

const finishedPicks = [
  { match: 'm7', prediction: 'draw', confidence: 80, correct: true },
  { match: 'm8', prediction: 'home', confidence: 60, correct: false },
]

let user = {
  id: 'u-demo', username: 'demo', email: 'demo@football.com', avatar_url: null,
  favorite_team: 'Real Madrid', total_predictions: 2, correct_predictions: 1,
  accuracy: '50.00', points: 10, role: 'user',
}

const rivals = [
  ['u1', 'maradona10', 'Boca Juniors', 180, 24, 18, '75.00'],
  ['u2', 'tikitaka', 'FC Barcelona', 150, 20, 15, '75.00'],
  ['u3', 'goleador', 'Manchester City', 130, 19, 13, '68.42'],
  ['u4', 'catenaccio', 'Inter Milan', 90, 15, 9, '60.00'],
  ['u5', 'pressing', 'Liverpool', 70, 12, 7, '58.33'],
].map(([id, username, favorite_team, points, total, correct, accuracy]) => ({
  id, username, avatar_url: null, favorite_team, points,
  total_predictions: total, correct_predictions: correct, accuracy,
}))

const picks = new Map()

const withPick = (m) => ({ ...m, user_prediction: picks.get(m.id) ?? null })
const byId = (id) => matches.find((m) => m.id === id)

function predictionRecords() {
  const done = finishedPicks.map((p, i) => {
    const m = byId(p.match)
    return { id: `p-done-${i}`, prediction: p.prediction, confidence: p.confidence, is_correct: p.correct,
      points_earned: p.correct ? 10 : 0, match: m, home: m.score?.home, away: m.score?.away }
  })
  const open = [...picks.entries()].map(([matchId, p], i) => ({
    id: `p-open-${i}`, prediction: p.prediction, confidence: p.confidence, is_correct: null,
    points_earned: 0, match: byId(matchId), home: null, away: null,
  }))
  return [...open, ...done].map(({ id, prediction, confidence, is_correct, points_earned, match: m, home, away }) => ({
    id, prediction, confidence, is_correct, points_earned,
    match_id: m.id, match_date: m.match_date, status: m.status,
    home_score: home, away_score: away,
    home_team_name: m.home_team.name, away_team_name: m.away_team.name,
    home_logo: m.home_team.logo, away_logo: m.away_team.logo, league_name: m.league.name,
  }))
}

function leaderboard() {
  const me = { ...user, total_predictions: user.total_predictions + picks.size }
  return [...rivals, me]
    .sort((a, b) => b.points - a.points)
    .map((u, i) => ({ ...u, rank: i + 1 }))
}

function send(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify(body))
}

function readBody(req) {
  return new Promise((resolve) => {
    let raw = ''
    req.on('data', (chunk) => (raw += chunk))
    req.on('end', () => {
      try {
        resolve(raw ? JSON.parse(raw) : {})
      } catch {
        resolve({})
      }
    })
  })
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`)
  const path = url.pathname.replace(/^\/api/, '')
  const q = url.searchParams
  const key = `${req.method} ${path}`
  console.log(key)

  if (key === 'GET /health') return send(res, 200, { status: 'OK', message: 'Servidor de prueba corriendo' })

  if (key === 'POST /auth/login') {
    const { email, password } = await readBody(req)
    if (email !== user.email || password !== 'password123') {
      return send(res, 401, { error: 'Credenciales inválidas.', code: 'INVALID_CREDENTIALS' })
    }
    return send(res, 200, { token: 'mock-token', user })
  }

  if (key === 'POST /auth/register') {
    const { username, email, favorite_team } = await readBody(req)
    user = { ...user, username, email, favorite_team: favorite_team ?? null,
      total_predictions: 0, correct_predictions: 0, accuracy: '0.00', points: 0 }
    finishedPicks.length = 0
    return send(res, 201, { token: 'mock-token', user })
  }

  if (key === 'GET /auth/me') return send(res, 200, { user: { ...user, total_predictions: user.total_predictions + picks.size } })
  if (key === 'GET /leagues') return send(res, 200, { leagues })

  if (key === 'GET /matches/today') {
    const list = matches.filter((m) => new Date(m.match_date) - Date.now() < 48 * HOUR && m.status !== 'finished')
    return send(res, 200, { total: list.length, matches: list.map(withPick) })
  }

  if (key === 'GET /matches') {
    const status = q.get('status')
    const league = Number(q.get('league_id')) || null
    const list = matches
      .filter((m) => (!status || m.status === status) && (!league || m.league.id === league))
      .sort((a, b) => new Date(a.match_date) - new Date(b.match_date))
    return send(res, 200, { total: list.length, matches: list.map(withPick) })
  }

  const detail = path.match(/^\/matches\/(\w+)$/)
  if (req.method === 'GET' && detail) {
    const m = byId(detail[1])
    return m ? send(res, 200, { match: withPick(m) }) : send(res, 404, { error: 'Partido no encontrado.' })
  }

  if (key === 'POST /predictions') {
    const { match_id, prediction, confidence } = await readBody(req)
    const m = byId(match_id)
    if (!m) return send(res, 404, { error: 'Partido no encontrado.' })
    if (m.status === 'finished') {
      return send(res, 400, { error: 'No puedes predecir un partido que ya terminó.', code: 'MATCH_FINISHED' })
    }
    picks.set(match_id, { prediction, confidence })
    return send(res, 201, { message: 'Predicción guardada.' })
  }

  if (key === 'GET /predictions/me') {
    const records = predictionRecords()
    const resolved = records.filter((r) => r.is_correct !== null)
    const correct = resolved.filter((r) => r.is_correct).length
    return send(res, 200, {
      stats: {
        total: records.length, correct, incorrect: resolved.length - correct,
        pending: records.length - resolved.length, total_points: correct * 10,
        accuracy: resolved.length ? ((correct / resolved.length) * 100).toFixed(2) : '0',
      },
      predictions: records,
    })
  }

  if (key === 'GET /predictions/leaderboard') return send(res, 200, { leaderboard: leaderboard() })

  return send(res, 404, { error: `Ruta ${req.url} no encontrada` })
})

server.listen(PORT, () => {
  console.log(`Servidor de prueba en http://localhost:${PORT}/api`)
  console.log('Cuenta demo: demo@football.com / password123')
})
