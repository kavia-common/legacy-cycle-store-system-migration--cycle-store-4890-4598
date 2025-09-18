'use strict';

const asyncHandler = require('../middleware/asyncHandler');
const responses = require('../utils/response');
const customersService = require('../services/customersService');

// PUBLIC_INTERFACE
exports.list = asyncHandler(async (req, res) => {
  const items = await customersService.list(req, req.query);
  return responses.ok(res, items);
});

// PUBLIC_INTERFACE
exports.create = asyncHandler(async (req, res) => {
  const created = await customersService.create(req, req.body);
  return responses.created(res, created);
});
