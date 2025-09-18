'use strict';

const config = require('../config');

// PUBLIC_INTERFACE
function requirePermission(permission) {
  /** Enforce that the authenticated user has the given permission.
   * Accepts a string or array of strings (any-of).
   */
  return (req, res, next) => {
    const roles = req.user?.roles || [];
    const matrix = config.rbac.matrix;
    const defaults = config.rbac.defaultPermissions || [];
    const userPerms = new Set(defaults);

    roles.forEach((r) => {
      (matrix[r] || []).forEach((p) => userPerms.add(p));
    });

    const needed = Array.isArray(permission) ? permission : [permission];
    const allowed = needed.some((p) => userPerms.has(p));
    if (!allowed) {
      return res.status(403).json({ error: 'Forbidden', message: 'Insufficient permissions', code: 403 });
    }
    return next();
  };
}

module.exports = { requirePermission };
