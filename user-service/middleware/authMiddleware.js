// user-service/middleware/authMiddleware.js
import jwt from 'jsonwebtoken'
import User from '../models/userModel.js'

const protect = async (req, res, next) => {
  let token

  // 1. Read the token from the 'Authorization' header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // 2. Get the token from the header (e.g., "Bearer <token>")
      token = req.headers.authorization.split(' ')[1]

      // 3. Verify the token using your JWT_SECRET
      const decoded = jwt.verify(token, process.env.JWT_SECRET)

      // 4. Find the user from the token's ID and attach them to the request
      req.user = await User.findById(decoded.id).select('-password')

      next() // Move on to the next function (the controller)
    } catch (error) {
      console.error(error)
      res.status(401).send('Not authorized, token failed')
    }
  }

  if (!token) {
    res.status(401).send('Not authorized, no token')
  }
}

export { protect }