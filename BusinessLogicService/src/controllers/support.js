'use strict';

const asyncHandler = require('../middleware/asyncHandler');
const responses = require('../utils/response');
const supportService = require('../services/supportService');

// PUBLIC_INTERFACE
exports.list = asyncHandler(async (req, res) => {
  const tickets = await supportService.list(req, req.query);
  return responses.ok(res, tickets);
});

// PUBLIC_INTERFACE
exports.create = asyncHandler(async (req, res) => {
  const created = await supportService.create(req, req.body);
  return responses.created(res, created);
});
