const auth = require('./auth');
const idempotency = require('./idempotency');

// This file exports middleware modules for reuse across routes
module.exports = {
  auth,
  idempotency,
};
