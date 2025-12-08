import dotenv from 'dotenv';
dotenv.config();

import pg from 'pg';
const { Pool } = pg;

// Parse connection string or use individual parameters
const getPoolConfig = () => {
  if (process.env.POSTGRES_URI) {
    return { connectionString: process.env.POSTGRES_URI };
  }
  
  return {
    host: process.env.POSTGRES_HOST || 'localhost',
    port: parseInt(process.env.POSTGRES_PORT || '5432'),
    database: process.env.POSTGRES_DB || 'eduno_db',
    user: process.env.POSTGRES_USER || 'postgres',
    password: String(process.env.POSTGRES_PASSWORD || '')
  };
};

const pool = new Pool({
  ...getPoolConfig(),
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Initialize database tables
export const initializeDatabase = async () => {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'teacher' CHECK (role IN ('teacher')),
        is_verified BOOLEAN DEFAULT FALSE,
        verified_at TIMESTAMP,
        failed_otp_attempts INTEGER DEFAULT 0,
        otp_locked_until TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS otps (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        code VARCHAR(10) NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        attempts INTEGER DEFAULT 0,
        is_used BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_otps_email ON otps(email);
      CREATE INDEX IF NOT EXISTS idx_otps_expires_at ON otps(expires_at);
    `);
    console.log('PostgreSQL tables initialized successfully');
  } catch (error) {
    console.error('PostgreSQL initialization error:', error);
    throw error;
  } finally {
    client.release();
  }
};

export const connectPostgres = async () => {
  try {
    await pool.query('SELECT NOW()');
    console.log('PostgreSQL connected successfully');
    await initializeDatabase();
  } catch (error) {
    console.error('PostgreSQL connection error:', error);
    process.exit(1);
  }
};

export default pool;
