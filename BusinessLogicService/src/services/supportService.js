'use strict';

const dataClient = require('./dataClient');

function validateTicket(payload) {
  const errors = [];
  if (!payload) errors.push('payload is required');
  if (payload && !payload.customerId && !payload.customer_id) errors.push('customerId is required');
  if (payload && !payload.subject) errors.push('subject is required');
  if (errors.length) {
    const err = new Error('Validation failed');
    err.status = 400;
    err.details = { errors };
    throw err;
  }
}

// PUBLIC_INTERFACE
async function list(req, query = {}) {
  const res = await dataClient.listEntities(req, 'SupportTicket', query);
  return res?.data || res;
}

// PUBLIC_INTERFACE
async function create(req, payload) {
  validateTicket(payload);
  const toCreate = {
    customer_id: payload.customerId ?? payload.customer_id,
    subject: payload.subject,
    description: payload.description || '',
    status: payload.status || 'open',
  };
  const res = await dataClient.createEntity(req, 'SupportTicket', toCreate);
  return res?.data || res;
}

module.exports = { list, create };
