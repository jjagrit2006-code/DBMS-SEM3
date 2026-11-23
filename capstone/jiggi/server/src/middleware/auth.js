const jwt = require('jsonwebtoken');
const { memoryState, isLive, getPool } = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'vortex_lounge_super_secure_jwt_secret_key_2026';

async function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  // Also support custom header for quick role switching/testing if token is not sent
  const testUserId = req.headers['x-vortex-user-id'];

  if (!token && !testUserId) {
    return res.status(401).json({ error: 'Access denied. Authentication token required.' });
  }

  try {
    if (token) {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
      return next();
    }

    if (testUserId) {
      const uid = parseInt(testUserId, 10);
      let user = null;
      if (isLive()) {
        const pool = getPool();
        const [rows] = await pool.query('SELECT user_id, username, email, role, full_name FROM users WHERE user_id = ?', [uid]);
        if (rows.length > 0) user = rows[0];
      } else {
        user = memoryState.users.find(u => u.user_id === uid);
      }

      if (!user) {
        return res.status(401).json({ error: 'User identified in request does not exist.' });
      }

      req.user = {
        user_id: user.user_id,
        username: user.username,
        email: user.email,
        role: user.role,
        full_name: user.full_name
      };
      return next();
    }
  } catch (err) {
    return res.status(403).json({ error: 'Invalid or expired session token.' });
  }
}

function requireRole(roles = []) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthenticated user.' });
    }
    const userRole = req.user.role;
    if (Array.isArray(roles) && !roles.includes(userRole)) {
      return res.status(403).json({ 
        error: `Access forbidden: Required role [${roles.join(', ')}], current role is [${userRole}].` 
      });
    }
    next();
  };
}

module.exports = {
  authenticateToken,
  requireRole,
  JWT_SECRET
};
