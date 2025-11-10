// product-service/controllers/productController.js
import Product from '../models/productModel.js'

// @desc    Fetch all products
// @route   GET /api/products
const getProducts = async (req, res) => {
  const products = await Product.find({}) // {} means find all
  res.json(products)
}

// @desc    Fetch single product by ID
// @route   GET /api/products/:id
const getProductById = async (req, res) => {
  const product = await Product.findById(req.params.id)

  if (product) {
    res.json(product)
  } else {
    res.status(404).send('Product not found')
  }
}

export { getProducts, getProductById }