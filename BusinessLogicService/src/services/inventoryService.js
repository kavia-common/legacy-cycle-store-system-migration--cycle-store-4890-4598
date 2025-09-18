'use strict';

const dataClient = require('./dataClient');

// Basic validation for creating/updating inventory items
function validateInventoryItem(item) {
  const errors = [];
  if (!item) errors.push('payload is required');
  if (item && (item.name === undefined || item.name === '')) errors.push('name is required');
  if (item && (item.quantity === undefined || item.quantity < 0)) errors.push('quantity must be >= 0');
  if (item && (item.price === undefined || item.price < 0)) errors.push('price must be >= 0');
  if (errors.length) {
    const err = new Error('Validation failed');
    err.status = 400;
    err.details = { errors };
    throw err;
  }
}

// PUBLIC_INTERFACE
async function list(req) {
  /** List inventory items with optional filters/pagination forwarded to DataService. */
  const data = await dataClient.listEntities(req, 'Inventory', req.query);
  return Array.isArray(data?.data) ? data.data : data;
}

// PUBLIC_INTERFACE
async function create(req, item) {
  /** Create a new inventory item after validation. */
  validateInventoryItem(item);
  // Can call DataService validation endpoint if available
  await dataClient.validateEntity(req, 'Inventory', { entity: 'Inventory', data: item });
  const created = await dataClient.createEntity(req, 'Inventory', item);
  return created?.data || created;
}

// PUBLIC_INTERFACE
async function update(req, id, item) {
  /** Update inventory item ensuring non-negative quantity, price. */
  validateInventoryItem(item);
  const updated = await dataClient.updateEntity(req, 'Inventory', id, item);
  return updated?.data || updated;
}

// PUBLIC_INTERFACE
async function getById(req, id) {
  /** Fetch a single inventory item by id. */
  const res = await dataClient.getEntity(req, 'Inventory', id);
  return res?.data || res;
}

// PUBLIC_INTERFACE
async function remove(req, id) {
  /** Delete inventory item by id. */
  await dataClient.deleteEntity(req, 'Inventory', id);
  return true;
}

module.exports = {
  list,
  create,
  update,
  getById,
  remove,
};
