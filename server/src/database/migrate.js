require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const { pool } = require('./db');

const createTables = async () => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    console.log('🔄 Creando tablas...\n');

    // ─── Tabla: users ─────────────────────────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        avatar_url VARCHAR(500),
        favorite_team VARCHAR(100),
        total_predictions INT DEFAULT 0,
        correct_predictions INT DEFAULT 0,
        accuracy DECIMAL(5,2) DEFAULT 0.00,
        points INT DEFAULT 0,
        role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    console.log('✅ Tabla users creada');

    // ─── Tabla: leagues ───────────────────────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS leagues (
        id SERIAL PRIMARY KEY,
        external_id INT,
        name VARCHAR(100) NOT NULL,
        country VARCHAR(100),
        logo_url VARCHAR(500),
        season INT,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    console.log('✅ Tabla leagues creada');

    // ─── Tabla: teams ─────────────────────────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS teams (
        id SERIAL PRIMARY KEY,
        external_id INT,
        name VARCHAR(100) NOT NULL,
        short_name VARCHAR(10),
        logo_url VARCHAR(500),
        country VARCHAR(100),
        league_id INT REFERENCES leagues(id),
        wins INT DEFAULT 0,
        draws INT DEFAULT 0,
        losses INT DEFAULT 0,
        goals_for INT DEFAULT 0,
        goals_against INT DEFAULT 0,
        form VARCHAR(20),
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    console.log('✅ Tabla teams creada');

    // ─── Tabla: matches ───────────────────────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS matches (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        external_id INT,
        league_id INT REFERENCES leagues(id),
        home_team_id INT REFERENCES teams(id),
        away_team_id INT REFERENCES teams(id),
        match_date TIMESTAMPTZ NOT NULL,
        status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'live', 'finished', 'postponed', 'cancelled')),
        home_score INT,
        away_score INT,
        venue VARCHAR(200),
        round VARCHAR(50),
        ai_prediction VARCHAR(20) CHECK (ai_prediction IN ('home', 'draw', 'away')),
        ai_confidence DECIMAL(5,2),
        ai_analysis TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    console.log('✅ Tabla matches creada');

    await client.query(`ALTER TABLE matches ADD COLUMN IF NOT EXISTS ai_analysis_en TEXT;`);

    // ─── Tabla: predictions (predicciones de usuarios) ────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS predictions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
        prediction VARCHAR(20) NOT NULL CHECK (prediction IN ('home', 'draw', 'away')),
        confidence INT CHECK (confidence BETWEEN 1 AND 100),
        is_correct BOOLEAN,
        points_earned INT DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(user_id, match_id)
      );
    `);
    console.log('✅ Tabla predictions creada');

    // ─── Tabla: leaderboard (vista materializada) ─────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS leaderboard_cache (
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        rank INT,
        username VARCHAR(50),
        avatar_url VARCHAR(500),
        points INT DEFAULT 0,
        total_predictions INT DEFAULT 0,
        correct_predictions INT DEFAULT 0,
        accuracy DECIMAL(5,2) DEFAULT 0.00,
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        PRIMARY KEY (user_id)
      );
    `);
    console.log('✅ Tabla leaderboard_cache creada');

    // ─── Índices para optimizar queries ───────────────────────────────────────
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_matches_date ON matches(match_date);
      CREATE INDEX IF NOT EXISTS idx_matches_status ON matches(status);
      CREATE INDEX IF NOT EXISTS idx_predictions_user ON predictions(user_id);
      CREATE INDEX IF NOT EXISTS idx_predictions_match ON predictions(match_id);
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE UNIQUE INDEX IF NOT EXISTS uq_leagues_external ON leagues(external_id);
      CREATE UNIQUE INDEX IF NOT EXISTS uq_teams_external ON teams(external_id);
      CREATE UNIQUE INDEX IF NOT EXISTS uq_matches_external ON matches(external_id);
    `);
    console.log('✅ Índices creados');

    await client.query('COMMIT');
    console.log('\n🎉 Migración completada exitosamente');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error en migración:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
};

createTables();
