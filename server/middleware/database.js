const mongoose = require('mongoose');

// Check if database is connected
const checkDBConnection = (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    // Database not connected, return appropriate error for auth/analysis routes
    if (req.path.startsWith('/api/auth') || req.path.startsWith('/api/analysis')) {
      return res.status(503).json({
        error: 'Service Unavailable',
        message: 'Database connection is not available. Please try again later.',
        fallback: 'You can still use the app with local storage for saving analyses.'
      });
    }
  }
  next();
};

// Optional: Allow certain endpoints to work without database
const allowWithoutDB = (req, res, next) => {
  // Always allow health check
  if (req.path === '/health') {
    return next();
  }
  
  // Check database for other routes
  checkDBConnection(req, res, next);
};

module.exports = {
  checkDBConnection,
  allowWithoutDB
};

