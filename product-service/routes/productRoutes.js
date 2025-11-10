// product-service/routes/productRoutes.js
import express from 'express'
const router = express.Router()
import {
  getProducts,
  getProductById,
} from '../controllers/productController.js'

// Routes
router.get('/', getProducts)
router.get('/:id', getProductById)

export default router