const store = require('../utils/idempotencyStore');

/**
 * PUBLIC_INTERFACE
 * idempotencyMiddleware - Enforces idempotency using the Idempotency-Key header.
 * - For POST/PUT/PATCH/DELETE requests with an Idempotency-Key header, this middleware:
 *   - Returns the previously cached response if the same key is seen again within TTL.
 *   - Otherwise allows the request to proceed and captures the response for caching.
 */
function idempotencyMiddleware(req, res, next) {
  const method = (req.method || '').toUpperCase();
  const applicable = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method);
  if (!applicable) return next();

  const key = req.headers['idempotency-key'];
  if (!key) return next();

  const hit = store.get(key);
  if (hit) {
    // Return cached response
    res.status(hit.statusCode);
    return res.json(hit.payload);
  }

  // Wrap res.json to capture payload for storage
  const originalJson = res.json.bind(res);
  res.json = (body) => {
    try {
      const statusCode = res.statusCode || 200;
      store.set(key, { statusCode, payload: body });
    } catch (e) {
      // best-effort cache, do not break response flow
    }
    return originalJson(body);
  };

  return next();
}

module.exports = idempotencyMiddleware;
