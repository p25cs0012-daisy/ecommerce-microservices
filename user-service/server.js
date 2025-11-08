// user-service/server.js
import express from 'express'
import dotenv from 'dotenv'import connectDB from './config/db.js'
import userRoutes from './routes/userRoutes.js'

// Load .env variables
dotenv.config()

const app = express()
app.use(express.json()) // Middleware to parse JSON bodies

app.get('/', (req, res) => {
  res.send('User Service is running...')
})

const PORT = process.env.PORT || 5001
app.listen(PORT, () => {
  console.log(`User Service listening on port ${PORT}`)
})