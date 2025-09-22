const jwt = require('jsonwebtoken');

/**
 * PUBLIC_INTERFACE
 * authMiddleware - Verifies Bearer JWT tokens on incoming requests.
 * - Expects Authorization: Bearer <token>
 * - Uses JWT_SECRET to validate the token
 */
function authMiddleware(req, res, next) {
  /** This middleware validates JWT tokens included in the Authorization header.
   * On success, the decoded token is attached to req.user.
   * On failure, responds with HTTP 401.
   */
  const header = req.headers.authorization || '';
  const parts = header.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({ error: 'unauthorized', message: 'Missing or invalid Authorization header', code: 401 });
  }
  const token = parts[1];

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      // If misconfigured, fail closed.
      return res.status(500).json({ error: 'server_error', message: 'JWT secret not configured', code: 500 });
    }
    const decoded = jwt.verify(token, secret);
    req.user = decoded;
    return next();
  } catch (err) {
    return res.status(401).json({ error: 'unauthorized', message: 'Invalid or expired token', code: 401 });
  }
}

module.exports = authMiddleware;
