'use strict';

const asyncHandler = require('../middleware/asyncHandler');
const responses = require('../utils/response');
const inventoryService = require('../services/inventoryService');

// PUBLIC_INTERFACE
exports.list = asyncHandler(async (req, res) => {
  /** List inventory items */
  const items = await inventoryService.list(req);
  return responses.ok(res, items);
});

// PUBLIC_INTERFACE
exports.create = asyncHandler(async (req, res) => {
  /** Create inventory item */
  const created = await inventoryService.create(req, req.body);
  return responses.created(res, created);
});

// PUBLIC_INTERFACE
exports.getById = asyncHandler(async (req, res) => {
  /** Get inventory by id */
  const item = await inventoryService.getById(req, req.params.id);
  if (!item) return responses.notFound(res, 'Inventory item not found');
  return responses.ok(res, item);
});

// PUBLIC_INTERFACE
exports.update = asyncHandler(async (req, res) => {
  /** Update inventory item by id */
  const updated = await inventoryService.update(req, req.params.id, req.body);
  return responses.ok(res, updated);
});

// PUBLIC_INTERFACE
exports.remove = asyncHandler(async (req, res) => {
  /** Delete inventory item by id */
  await inventoryService.remove(req, req.params.id);
  return responses.noContent(res);
});
