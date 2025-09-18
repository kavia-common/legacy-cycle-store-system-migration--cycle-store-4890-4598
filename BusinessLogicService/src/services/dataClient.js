'use strict';

const axios = require('axios');
const config = require('../config');
const logger = require('../utils/logger');

const client = axios.create({
  baseURL: config.dataService.baseUrl,
  timeout: config.dataService.timeout,
});

// forward auth header to DataService
function authHeaders(req) {
  const headers = {};
  if (req.headers.authorization) headers.Authorization = req.headers.authorization;
  return headers;
}

async function handle(promise, context = {}) {
  try {
    const res = await promise;
    return res.data;
  } catch (err) {
    const status = err.response?.status || 500;
    logger.error('DataService call failed', { status, context, error: err.message });
    const data = err.response?.data;
    const message = (data && (data.message || data.error)) || err.message || 'DataService error';
    const error = new Error(message);
    error.status = status;
    error.details = data;
    throw error;
  }
}

module.exports = {
  // Inventory
  listEntities: (req, entity, params = {}) =>
    handle(client.get(`/${encodeURIComponent(entity)}`, { params, headers: authHeaders(req) }), { op: 'list', entity }),
  createEntity: (req, entity, payload) =>
    handle(client.post(`/${encodeURIComponent(entity)}`, payload, { headers: authHeaders(req) }), { op: 'create', entity }),
  getEntity: (req, entity, id) =>
    handle(client.get(`/${encodeURIComponent(entity)}/${encodeURIComponent(id)}`, { headers: authHeaders(req) }), { op: 'get', entity, id }),
  updateEntity: (req, entity, id, payload) =>
    handle(client.put(`/${encodeURIComponent(entity)}/${encodeURIComponent(id)}`, payload, { headers: authHeaders(req) }), { op: 'update', entity, id }),
  deleteEntity: (req, entity, id) =>
    handle(client.delete(`/${encodeURIComponent(entity)}/${encodeURIComponent(id)}`, { headers: authHeaders(req) }), { op: 'delete', entity, id }),

  // Validation and Migration
  validateEntity: (req, entity, payload) =>
    handle(client.post(`/validation/${encodeURIComponent(entity)}`, payload, { headers: authHeaders(req) }), { op: 'validate', entity }),
  migrationImport: (req, payload) =>
    handle(client.post('/migration/import', payload, { headers: authHeaders(req) }), { op: 'migration:import' }),
  migrationExport: (req, payload) =>
    handle(client.post('/migration/export', payload, { headers: authHeaders(req) }), { op: 'migration:export' }),
};
