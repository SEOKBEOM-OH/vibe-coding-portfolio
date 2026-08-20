const express = require('express')
const cors = require('cors')
const { getPool } = require('./config/db')
const menusRouter = require('./routes/menus')
const ordersRouter = require('./routes/orders')

function normalizeOrigin(url) {
  return String(url || '').trim().replace(/\/$/, '')
}

function isAllowedOrigin(origin) {
  if (!origin) return true

  const normalized = normalizeOrigin(origin)
  const allowed = (process.env.CLIENT_URL || 'http://localhost:5173')
    .split(',')
    .map(normalizeOrigin)
    .filter(Boolean)

  if (allowed.includes('*') || allowed.includes(normalized)) return true

  try {
    return new URL(normalized).hostname.endsWith('.onrender.com')
  } catch {
    return false
  }
}

function createApp() {
  const app = express()

  app.use(
    cors({
      origin(origin, callback) {
        callback(null, isAllowedOrigin(origin))
      },
    }),
  )
  app.use(express.json())

  app.get('/', async (req, res) => {
    try {
      await getPool().query('SELECT 1')
      res.json({
        ok: true,
        message: 'Cafe U API is running',
        database: 'connected',
      })
    } catch (error) {
      res.status(503).json({
        ok: false,
        message: 'Cafe U API is running, but database is disconnected',
        database: 'disconnected',
      })
    }
  })

  app.use('/menus', menusRouter)
  app.use('/orders', ordersRouter)

  app.use((req, res) => {
    res.status(404).json({
      ok: false,
      message: `Not found: ${req.method} ${req.originalUrl}`,
    })
  })

  return app
}

module.exports = createApp
