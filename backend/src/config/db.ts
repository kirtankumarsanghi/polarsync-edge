import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL || 'postgres://polarsync:polarpass123@timescaledb:5432/polarsync_edge';

export const pool = new Pool({
  connectionString,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 3000,
});

let isDbConnected = false;

pool.on('connect', () => {
  if (!isDbConnected) {
    console.log('[TimescaleDB] Successfully connected to TimescaleDB edge hypertable cluster.');
    isDbConnected = true;
  }
});

pool.on('error', (err) => {
  console.error('[TimescaleDB] Unexpected pool error on idle client:', err.message);
  isDbConnected = false;
});

export const checkDatabaseHealth = async (): Promise<boolean> => {
  try {
    const client = await pool.connect();
    await client.query('SELECT 1;');
    client.release();
    return true;
  } catch (err: any) {
    console.warn(`[TimescaleDB] Health check warning: ${err.message}. Operating in resilient cache mode.`);
    return false;
  }
};
