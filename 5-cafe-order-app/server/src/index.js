const path = require('path')

require('dotenv').config({ path: path.join(__dirname, '..', '.env') })

const createApp = require('./app')
const { connectDB } = require('./config/db')
const { initSchema } = require('./config/schema')

const PORT = process.env.PORT || 4000

async function startServer() {
  try {
    await connectDB()
    await initSchema()
    const app = createApp()
    app.listen(PORT, () => {
      console.log(`Server running: http://localhost:${PORT}`)
    })
  } catch (error) {
    console.error('서버 시작 실패:', error.message)
    process.exit(1)
  }
}

startServer()
