const { Pool } = require('pg')

let pool

function getDatabaseName(databaseUrl) {
  return new URL(databaseUrl).pathname.replace(/^\//, '')
}

function getAdminUrl(databaseUrl) {
  const url = new URL(databaseUrl)
  url.pathname = '/postgres'
  return url.toString()
}

function quoteIdent(name) {
  return `"${name.replace(/"/g, '""')}"`
}

function useSsl(databaseUrl) {
  return /render\.com|sslmode=require/i.test(databaseUrl)
}

function poolOptions(databaseUrl) {
  return {
    connectionString: databaseUrl,
    ssl: useSsl(databaseUrl) ? { rejectUnauthorized: false } : undefined,
  }
}

async function ensureDatabase(databaseUrl) {
  if (useSsl(databaseUrl) || process.env.SKIP_ENSURE_DB === 'true') return

  const dbName = getDatabaseName(databaseUrl)
  const adminPool = new Pool(poolOptions(getAdminUrl(databaseUrl)))

  try {
    const found = await adminPool.query('SELECT 1 FROM pg_database WHERE datname = $1', [dbName])
    if (found.rowCount === 0) {
      await adminPool.query(`CREATE DATABASE ${quoteIdent(dbName)}`)
      console.log(`데이터베이스 생성: ${dbName}`)
    }
  } finally {
    await adminPool.end()
  }
}

async function connectDB() {
  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) {
    throw new Error('DATABASE_URL 이 .env 에 없습니다.')
  }

  await ensureDatabase(databaseUrl)

  pool = new Pool(poolOptions(databaseUrl))
  const result = await pool.query('SELECT current_database() AS name')
  console.log(`PostgreSQL 데이터베이스 연결 성공: ${result.rows[0].name}`)
  return pool
}

function getPool() {
  if (!pool) {
    throw new Error('데이터베이스가 아직 연결되지 않았습니다.')
  }
  return pool
}

module.exports = { connectDB, getPool }
