// order-service/middleware/authMiddleware.js
import jwt from 'jsonwebtoken'

const protect = async (req, res, next) => {
  let token

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1]

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET)

      // Attach the user ID to the request for the controller to use
      req.user = {
        _id: decoded.id,
      }

      next()
    } catch (error) {
      console.error(error)
      res.status(401).send('Not authorized, token failed')
    }
  }

  if (!token) {
    res.status(401).send('Not authorized, no token')
  }
}

export { protect } // <-- Make sure this line is correct
