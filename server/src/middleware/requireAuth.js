const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  // Read token from Authorization header
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach user info (id, role) to the request object
    next(); // Pass control to the next function (the actual route handler)
  } catch (err) {
    res.status(401).json({ message: 'Invalid token.' });
  }
};
