// order-service/routes/orderRoutes.js
import express from 'express'
const router = express.Router()
import { addOrderItems } from '../controllers/orderController.js'
import { protect } from '../middleware/authMiddleware.js' // <-- Import middleware

// We protect the root route.
// POST to /api/orders will run 'protect' first, then 'addOrderItems'
router.post('/', protect, addOrderItems) 

export default router