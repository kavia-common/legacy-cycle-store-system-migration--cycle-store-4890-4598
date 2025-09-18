'use strict';

const asyncHandler = require('../middleware/asyncHandler');
const responses = require('../utils/response');
const salesService = require('../services/salesService');

// PUBLIC_INTERFACE
exports.process = asyncHandler(async (req, res) => {
  /** Process a sales transaction */
  const result = await salesService.processSale(req, req.body);
  return responses.created(res, result);
});
