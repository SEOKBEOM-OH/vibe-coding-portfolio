const express = require('express')
const cors = require('cors')
const { getPool } = require('./config/db')
const menusRouter = require('./routes/menus')
const ordersRouter = require('./routes/orders')

function createApp() {
  const app = express()
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173'

  app.use(cors({ origin: clientUrl }))
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
