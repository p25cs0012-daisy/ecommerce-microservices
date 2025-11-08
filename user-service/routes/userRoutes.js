// user-service/routes/userRoutes.js
import express from 'express'
const router = express.Router()
import {
  registerUser,
  loginUser,
  getUserProfile, // <-- 1. Import new controller
} from '../controllers/userController.js'
import { protect } from '../middleware/authMiddleware.js' // <-- 2. Import middleware

// Public routes
router.post('/register', registerUser)
router.post('/login', loginUser)

// Private route
// This route will first run `protect`, then `getUserProfile`
router.get('/profile', protect, getUserProfile) // <-- 3. Add protected route

export default router