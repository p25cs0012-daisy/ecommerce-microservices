// product-service/server.js
import express from 'express'
import dotenv from 'dotenv'

dotenv.config()
const app = express()
app.use(express.json())

app.get('/', (req, res) => {
  res.send('Product Service is running...')
})

const PORT = process.env.PORT || 5002 // Note: Port 5002
app.listen(PORT, () => {
  console.log(`Product Service listening on port ${PORT}`)
})