'use strict';

const jwt = require('jsonwebtoken');
const config = require('../config');
const logger = require('../utils/logger');

function extractToken(req) {
  const h = req.headers.authorization || '';
  if (!h.toLowerCase().startsWith('bearer ')) return null;
  return h.slice(7).trim();
}

// PUBLIC_INTERFACE
function authenticateJWT(req, res, next) {
  /** Authenticate requests using JWT Bearer tokens.
   * On success, attaches req.user = { sub, roles, permissions?, ... }.
   * On failure, responds 401 Unauthorized.
   */
  try {
    const token = extractToken(req);
    if (!token) return res.status(401).json({ error: 'Unauthorized', message: 'Missing bearer token', code: 401 });

    const payload = jwt.verify(token, config.security.jwtSecret, {
      issuer: config.security.tokenIssuer,
      audience: config.security.tokenAudience,
      ignoreExpiration: false,
    });

    // normalize roles to array
    const roles = Array.isArray(payload.roles) ? payload.roles : (payload.role ? [payload.role] : []);
    req.user = { ...payload, roles };
    return next();
  } catch (err) {
    logger.warn('JWT verification failed', { err: err.message });
    return res.status(401).json({ error: 'Unauthorized', message: 'Invalid or expired token', code: 401 });
  }
}

module.exports = {
  authenticateJWT,
};
