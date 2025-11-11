// order-service/server.js
import express from 'express'
import dotenv from 'dotenv'

dotenv.config()
const app = express()
app.use(express.json())

app.get('/', (req, res) => {
  res.send('Order Service is running...')
})

const PORT = process.env.PORT || 5003 // <-- Note: Port 5003
app.listen(PORT, () => {
  console.log(`Order Service listening on port ${PORT}`)
})