// product-service/seeder.js
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import products from './data/products.js'
import Product from './models/productModel.js'
// Note: We need to import the User model if we add user data
// import User from './models/userModel.js' 
import connectDB from './config/db.js'

dotenv.config()
connectDB()

const importData = async () => {
  try {
    // Clear all existing data
    await Product.deleteMany()
    // await User.deleteMany() // if we had user data

    // Insert sample products
    await Product.insertMany(products)

    console.log('Data Imported!')
    process.exit()
  } catch (error) {
    console.error(`${error}`)
    process.exit(1)
  }
}

const destroyData = async () => {
  try {
    await Product.deleteMany()
    // await User.deleteMany()

    console.log('Data Destroyed!')
    process.exit()
  } catch (error) {
    console.error(`${error}`)
    process.exit(1)
  }
}

// Check for command-line argument '-d' to destroy
if (process.argv[2] === '-d') {
  destroyData()
} else {
  importData()
}