require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const { pool } = require('./db');
const bcrypt = require('bcryptjs');

const seed = async () => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    console.log('🌱 Insertando datos de prueba...\n');

    // ─── Ligas ────────────────────────────────────────────────────────────────
    const leagues = [
      { external_id: 140, name: 'La Liga', country: 'España', logo_url: 'https://media.api-sports.io/football/leagues/140.png', season: 2024 },
      { external_id: 39, name: 'Premier League', country: 'Inglaterra', logo_url: 'https://media.api-sports.io/football/leagues/39.png', season: 2024 },
      { external_id: 135, name: 'Serie A', country: 'Italia', logo_url: 'https://media.api-sports.io/football/leagues/135.png', season: 2024 },
      { external_id: 78, name: 'Bundesliga', country: 'Alemania', logo_url: 'https://media.api-sports.io/football/leagues/78.png', season: 2024 },
      { external_id: 2, name: 'UEFA Champions League', country: 'Europa', logo_url: 'https://media.api-sports.io/football/leagues/2.png', season: 2024 },
    ];

    const leagueIds = {};
    for (const league of leagues) {
      const res = await client.query(
        `INSERT INTO leagues (external_id, name, country, logo_url, season)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT DO NOTHING RETURNING id`,
        [league.external_id, league.name, league.country, league.logo_url, league.season]
      );
      if (res.rows[0]) leagueIds[league.name] = res.rows[0].id;
    }
    console.log('✅ Ligas insertadas');

    // ─── Equipos ──────────────────────────────────────────────────────────────
    const teams = [
      { name: 'Real Madrid', short_name: 'RMA', logo_url: 'https://media.api-sports.io/football/teams/541.png', country: 'España', league: 'La Liga', wins: 12, draws: 3, losses: 2, goals_for: 38, goals_against: 18, form: 'WWDWW' },
      { name: 'FC Barcelona', short_name: 'BAR', logo_url: 'https://media.api-sports.io/football/teams/529.png', country: 'España', league: 'La Liga', wins: 11, draws: 4, losses: 2, goals_for: 35, goals_against: 20, form: 'WDWWL' },
      { name: 'Atlético Madrid', short_name: 'ATM', logo_url: 'https://media.api-sports.io/football/teams/530.png', country: 'España', league: 'La Liga', wins: 10, draws: 3, losses: 4, goals_for: 28, goals_against: 16, form: 'LWWDW' },
      { name: 'Manchester City', short_name: 'MCI', logo_url: 'https://media.api-sports.io/football/teams/50.png', country: 'Inglaterra', league: 'Premier League', wins: 13, draws: 2, losses: 2, goals_for: 42, goals_against: 15, form: 'WWWWW' },
      { name: 'Arsenal', short_name: 'ARS', logo_url: 'https://media.api-sports.io/football/teams/42.png', country: 'Inglaterra', league: 'Premier League', wins: 12, draws: 3, losses: 2, goals_for: 38, goals_against: 17, form: 'WWDWW' },
      { name: 'Liverpool', short_name: 'LIV', logo_url: 'https://media.api-sports.io/football/teams/40.png', country: 'Inglaterra', league: 'Premier League', wins: 11, draws: 4, losses: 2, goals_for: 36, goals_against: 19, form: 'DWWWW' },
      { name: 'Inter Milan', short_name: 'INT', logo_url: 'https://media.api-sports.io/football/teams/505.png', country: 'Italia', league: 'Serie A', wins: 13, draws: 2, losses: 1, goals_for: 40, goals_against: 14, form: 'WWWWW' },
      { name: 'AC Milan', short_name: 'MIL', logo_url: 'https://media.api-sports.io/football/teams/489.png', country: 'Italia', league: 'Serie A', wins: 10, draws: 4, losses: 3, goals_for: 32, goals_against: 21, form: 'WDWLW' },
      { name: 'Bayern Munich', short_name: 'BAY', logo_url: 'https://media.api-sports.io/football/teams/157.png', country: 'Alemania', league: 'Bundesliga', wins: 14, draws: 1, losses: 1, goals_for: 48, goals_against: 12, form: 'WWWWW' },
      { name: 'Borussia Dortmund', short_name: 'BVB', logo_url: 'https://media.api-sports.io/football/teams/165.png', country: 'Alemania', league: 'Bundesliga', wins: 10, draws: 3, losses: 4, goals_for: 34, goals_against: 25, form: 'WLWDW' },
    ];

    const teamIds = {};
    for (const team of teams) {
      const leagueId = leagueIds[team.league];
      const res = await client.query(
        `INSERT INTO teams (name, short_name, logo_url, country, league_id, wins, draws, losses, goals_for, goals_against, form)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         ON CONFLICT DO NOTHING RETURNING id`,
        [team.name, team.short_name, team.logo_url, team.country, leagueId, team.wins, team.draws, team.losses, team.goals_for, team.goals_against, team.form]
      );
      if (res.rows[0]) teamIds[team.name] = res.rows[0].id;
    }
    console.log('✅ Equipos insertados');

    // ─── Partidos mock ────────────────────────────────────────────────────────
    const now = new Date();
    const matches = [
      {
        league: 'La Liga', home: 'Real Madrid', away: 'FC Barcelona',
        date: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000),
        status: 'scheduled', venue: 'Santiago Bernabéu',
        ai_prediction: 'home', ai_confidence: 62.5,
        ai_analysis: 'El Real Madrid llega como favorito jugando en casa con una racha de 5 victorias consecutivas. Su media de goles en casa es de 2.8 por partido. Barcelona ha mostrado inconsistencia fuera de casa con 3 derrotas en los últimos 5 partidos como visitante. La baja del mediocampista titular del Barça es un factor decisivo. Predicción: Victoria del Real Madrid.'
      },
      {
        league: 'Premier League', home: 'Manchester City', away: 'Arsenal',
        date: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000),
        status: 'scheduled', venue: 'Etihad Stadium',
        ai_prediction: 'home', ai_confidence: 58.0,
        ai_analysis: 'Manchester City domina en el Etihad con 87% de victorias esta temporada. Arsenal ha mejorado defensivamente pero su ataque pierde eficiencia fuera de casa. El City tiene una presión ofensiva que dificulta cualquier repliegue. Probabilidades: City 58%, Empate 22%, Arsenal 20%.'
      },
      {
        league: 'Serie A', home: 'Inter Milan', away: 'AC Milan',
        date: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
        status: 'scheduled', venue: 'San Siro',
        ai_prediction: 'home', ai_confidence: 55.0,
        ai_analysis: 'El Derby della Madonnina con Inter como favorito. Inter tiene la mejor defensa de la Serie A esta temporada (14 goles en contra). Milan ha mejorado en los últimos partidos pero el factor estadio juega en contra. Predicción ajustada: Inter con ventaja mínima.'
      },
      {
        league: 'Bundesliga', home: 'Bayern Munich', away: 'Borussia Dortmund',
        date: new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000),
        status: 'scheduled', venue: 'Allianz Arena',
        ai_prediction: 'home', ai_confidence: 71.0,
        ai_analysis: 'Der Klassiker con Bayern dominando la Bundesliga. Bayern tiene 48 goles anotados — el mejor ataque de Europa. Dortmund ha sido inconsistente con 4 derrotas en los últimos 7 partidos. La diferencia de calidad en plantilla es notable. Bayern claro favorito.'
      },
      {
        league: 'La Liga', home: 'Atlético Madrid', away: 'Real Madrid',
        date: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
        status: 'finished', home_score: 1, away_score: 2, venue: 'Wanda Metropolitano',
        ai_prediction: 'away', ai_confidence: 53.0,
        ai_analysis: 'Real Madrid favorito externo en el Metropolitano. Atlético es sólido en casa pero el Madrid tiene mejor forma reciente.'
      },
      {
        league: 'Premier League', home: 'Liverpool', away: 'Arsenal',
        date: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
        status: 'scheduled', venue: 'Anfield',
        ai_prediction: 'home', ai_confidence: 50.5,
        ai_analysis: 'Partido muy parejo en Anfield. Liverpool en buena forma en casa pero Arsenal ha demostrado capacidad para ganar partidos grandes. Se esperan goles en ambas porterías. Ligera ventaja para Liverpool por el factor Anfield.'
      },
    ];

    for (const match of matches) {
      const leagueId = leagueIds[match.league];
      const homeId = teamIds[match.home];
      const awayId = teamIds[match.away];
      if (!homeId || !awayId) continue;

      await client.query(
        `INSERT INTO matches (league_id, home_team_id, away_team_id, match_date, status, home_score, away_score, venue, ai_prediction, ai_confidence, ai_analysis)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [leagueId, homeId, awayId, match.date, match.status, match.home_score || null, match.away_score || null, match.venue, match.ai_prediction, match.ai_confidence, match.ai_analysis]
      );
    }
    console.log('✅ Partidos mock insertados');

    // ─── Usuarios de prueba ───────────────────────────────────────────────────
    const passwordHash = await bcrypt.hash('password123', 10);
    const adminHash = await bcrypt.hash('admin123', 10);

    await client.query(
      `INSERT INTO users (username, email, password_hash, favorite_team, total_predictions, correct_predictions, accuracy, points, role)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       ON CONFLICT (email) DO NOTHING`,
      ['admin', 'admin@football.com', adminHash, 'Real Madrid', 50, 35, 70.00, 350, 'admin']
    );

    await client.query(
      `INSERT INTO users (username, email, password_hash, favorite_team, total_predictions, correct_predictions, accuracy, points, role)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       ON CONFLICT (email) DO NOTHING`,
      ['demo_user', 'demo@football.com', passwordHash, 'FC Barcelona', 25, 16, 64.00, 160, 'user']
    );

    console.log('✅ Usuarios de prueba insertados');
    console.log('   📧 Admin: admin@football.com / admin123');
    console.log('   📧 Demo:  demo@football.com / password123');

    await client.query('COMMIT');
    console.log('\n🎉 Seed completado exitosamente');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error en seed:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
};

seed();
