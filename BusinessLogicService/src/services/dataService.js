const axios = require('axios');

function buildClient() {
  const baseURL = process.env.DATA_SERVICE_URL;
  if (!baseURL) {
    throw new Error('DATA_SERVICE_URL is not configured');
  }
  const headers = {};
  if (process.env.SERVICE_AUTH_TOKEN) {
    headers.Authorization = `Bearer ${process.env.SERVICE_AUTH_TOKEN}`;
  }
  return axios.create({
    baseURL: baseURL.replace(/\/+$/, ''), // trim trailing slash
    headers,
    timeout: 10000,
  });
}

const client = buildClient();

/**
 * PUBLIC_INTERFACE
 * listEntities
 * @param {string} entity - Entity name (e.g., Inventory)
 * @param {object} params - Query params (pagination, filters)
 */
async function listEntities(entity, params = {}) {
  const res = await client.get(`/${encodeURIComponent(entity)}`, { params });
  return res.data;
}

/**
 * PUBLIC_INTERFACE
 * createEntity
 * @param {string} entity
 * @param {object} data
 */
async function createEntity(entity, data) {
  const res = await client.post(`/${encodeURIComponent(entity)}`, data);
  return res.data;
}

/**
 * PUBLIC_INTERFACE
 * getEntityById
 */
async function getEntityById(entity, id) {
  const res = await client.get(`/${encodeURIComponent(entity)}/${encodeURIComponent(id)}`);
  return res.data;
}

/**
 * PUBLIC_INTERFACE
 * updateEntity
 */
async function updateEntity(entity, id, data) {
  const res = await client.put(`/${encodeURIComponent(entity)}/${encodeURIComponent(id)}`, data);
  return res.data;
}

/**
 * PUBLIC_INTERFACE
 * deleteEntity
 */
async function deleteEntity(entity, id) {
  const res = await client.delete(`/${encodeURIComponent(entity)}/${encodeURIComponent(id)}`);
  return res.data;
}

/**
 * PUBLIC_INTERFACE
 * validateEntity - calls validation endpoint in DataService
 */
async function validateEntity(entity, data) {
  const res = await client.post(`/validation/${encodeURIComponent(entity)}`, { entity, data });
  return res.data;
}

module.exports = {
  listEntities,
  createEntity,
  getEntityById,
  updateEntity,
  deleteEntity,
  validateEntity,
};
