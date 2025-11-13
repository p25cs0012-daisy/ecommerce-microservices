// // // order-service/server.js
// // import express from 'express'
// // import dotenv from 'dotenv'
// // import connectDB from './config/db.js'
// // import orderRoutes from './routes/orderRoutes.js'

// // dotenv.config()
// // connectDB()
// // app.use(express.json())
// // const app = express()
// // app.use(express.json())

// // app.get('/', (req, res) => {
// //   res.send('Order Service is running...')

// // })

// // app.use('/api/orders', orderRoutes)

// // const PORT = process.env.PORT || 5003 // <-- Note: Port 5003
// // app.listen(PORT, () => {
// //   console.log(`Order Service listening on port ${PORT}`)
// // })

// // order-service/server.js
// import express from 'express'
// import dotenv from 'dotenv'
// import connectDB from './config/db.js'
// import orderRoutes from './routes/orderRoutes.js'

// dotenv.config()
// connectDB()

// // 1. Create the app FIRST
// const app = express()

// // 2. THEN use the middleware
// app.use(express.json()) 

// // Check for JWT_SECRET (good practice)
// if (!process.env.JWT_SECRET) {
//   console.error('FATAL ERROR: JWT_SECRET is not defined.')
//   process.exit(1)
// }

// app.get('/', (req, res) => {
//   res.send('Order Service is running...')
// })

// // 3. THEN define your routes
// app.use('/api/orders', orderRoutes) 

// const PORT = process.env.PORT || 5003
// app.listen(PORT, () => {
//   console.log(`Order Service listening on port ${PORT}`)
// })
