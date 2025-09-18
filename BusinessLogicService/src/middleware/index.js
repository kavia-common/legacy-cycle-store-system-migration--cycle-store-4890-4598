const { authenticateJWT } = require('./auth');
const { requirePermission } = require('./rbac');

module.exports = {
  authenticateJWT,
  requirePermission,
};
