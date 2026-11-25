const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const embeddedDb = require('./embeddedDb');

require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'mahalaxmi_novelties',
  waitForConnections: true,
  connectionLimit: 15,
  queueLimit: 0,
  multipleStatements: true,
  charset: 'utf8mb4',
  connectTimeout: 4000
};

let pool = null;
let isConnected = false;
let usingFallback = false;
let initPromise = null;

function getPool() {
  if (!pool && !usingFallback) {
    try {
      pool = mysql.createPool(dbConfig);
    } catch (e) {
      console.warn('MySQL pool creation warning:', e.message);
    }
  }
  return pool;
}

/**
 * Execute parameterized query against active database (MySQL or Embedded JSON store)
 */
async function query(sql, params = []) {
  await ensureDbInitialized();
  if (isConnected && pool && !usingFallback) {
    const [rows] = await pool.execute(sql, params);
    return rows;
  }
  return embeddedDb.executeQuery(sql, params);
}

/**
 * Execute raw SQL (schema/seed scripts)
 */
async function rawQuery(sql) {
  if (isConnected && pool && !usingFallback) {
    const [result] = await pool.query(sql);
    return result;
  }
  return embeddedDb.executeQuery(sql);
}

/**
 * Get connection for manual transaction handling
 */
async function getConnection() {
  await ensureDbInitialized();
  if (isConnected && pool && !usingFallback) {
    return await pool.getConnection();
  }
  return embeddedDb.createEmbeddedConnection();
}

/**
 * Initialize Database once (safe for both standalone server and serverless functions)
 */
async function initDatabase() {
  if (initPromise) return initPromise;

  initPromise = (async () => {
    // On Vercel serverless without external DB host configured, immediately activate embedded store
    if (process.env.VERCEL && (!process.env.DB_HOST || process.env.DB_HOST === 'localhost')) {
      isConnected = false;
      usingFallback = true;
      embeddedDb.loadDb();
      return true;
    }

    try {
      const rootConnection = await mysql.createConnection({
        host: dbConfig.host,
        port: dbConfig.port,
        user: dbConfig.user,
        password: dbConfig.password,
        multipleStatements: true,
        connectTimeout: 4000
      });

      await rootConnection.query(
        `CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
      );
      await rootConnection.end();

      pool = mysql.createPool(dbConfig);
      isConnected = true;
      usingFallback = false;

      const schemaPath = path.resolve(__dirname, '../../../database/schema.sql');
      const seedPath = path.resolve(__dirname, '../../../database/seed.sql');

      if (fs.existsSync(schemaPath)) {
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');
        await rawQuery(schemaSql);
        console.log('✅ MySQL schema executed.');
      }

      if (fs.existsSync(seedPath)) {
        const seedSql = fs.readFileSync(seedPath, 'utf8');
        await rawQuery(seedSql);
        console.log('✅ MySQL core seeds executed.');
      }

      console.log(`🚀 Connected to MySQL "${dbConfig.database}" at ${dbConfig.host}:${dbConfig.port}`);
      return true;
    } catch (error) {
      isConnected = false;
      usingFallback = true;
      console.log('ℹ️ MySQL database connection bypassed (' + error.message + ').');
      console.log('✨ Activated Zero-Crash Persistent Embedded Database (`backend/data/db.json`).');
      embeddedDb.loadDb();
      return true;
    }
  })();

  return initPromise;
}

async function ensureDbInitialized() {
  if (!isConnected && !usingFallback) {
    await initDatabase();
  }
}

module.exports = {
  getPool,
  query,
  rawQuery,
  getConnection,
  initDatabase,
  ensureDbInitialized,
  isDbConnected: () => isConnected,
  isUsingFallback: () => usingFallback
};
