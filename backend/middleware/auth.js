const jwt = require('jsonwebtoken');
const auditLog = require('../utils/auditLogger');

const authenticate = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; 
  if (!token) {
    await auditLog({
      action: 'AUTH_FAILED', resource: req.path,
      method: req.method, success: false,
      message: 'No token provided', req,
    });
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

   
    req.user = decoded; 
    next();

  } catch (err) {
    await auditLog({
      action: 'AUTH_FAILED', resource: req.path,
      method: req.method, success: false,
      message: err.name === 'TokenExpiredError' ? 'Token expired' : 'Invalid token',
      req,
    });

    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired. Please log in again.' });
    }
    return res.status(403).json({ error: 'Invalid token.' });
  }
};

module.exports = authenticate;
