'use strict';

const dataClient = require('./dataClient');

function validateCustomer(payload) {
  const errors = [];
  if (!payload) errors.push('payload is required');
  if (payload && !payload.first_name) errors.push('first_name is required');
  if (payload && !payload.last_name) errors.push('last_name is required');
  if (payload && !payload.email) errors.push('email is required');
  if (errors.length) {
    const err = new Error('Validation failed');
    err.status = 400;
    err.details = { errors };
    throw err;
  }
}

// PUBLIC_INTERFACE
async function list(req, query = {}) {
  const res = await dataClient.listEntities(req, 'Customer', query);
  return res?.data || res;
}

// PUBLIC_INTERFACE
async function create(req, payload) {
  validateCustomer(payload);
  const res = await dataClient.createEntity(req, 'Customer', payload);
  return res?.data || res;
}

module.exports = { list, create };
