const auth = require('./auth');
const idempotency = require('./idempotency');
const logger = require('./logger');

// This file exports middleware modules for reuse across routes
module.exports = {
  auth,
  idempotency,
  logger,
};
