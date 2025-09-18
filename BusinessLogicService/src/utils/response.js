'use strict';

function ok(res, data, meta) {
  return res.status(200).json({ status: 'success', data, meta });
}

function created(res, data, meta) {
  return res.status(201).json({ status: 'success', data, meta });
}

function noContent(res) {
  return res.status(204).send();
}

function badRequest(res, message, details) {
  return res.status(400).json({ error: 'BadRequest', message, code: 400, details });
}

function unauthorized(res, message = 'Unauthorized') {
  return res.status(401).json({ error: 'Unauthorized', message, code: 401 });
}

function forbidden(res, message = 'Forbidden') {
  return res.status(403).json({ error: 'Forbidden', message, code: 403 });
}

function notFound(res, message = 'Not Found') {
  return res.status(404).json({ error: 'NotFound', message, code: 404 });
}

function conflict(res, message = 'Conflict') {
  return res.status(409).json({ error: 'Conflict', message, code: 409 });
}

function serverError(res, message = 'Internal Server Error', details) {
  return res.status(500).json({ error: 'ServerError', message, code: 500, details });
}

module.exports = {
  ok,
  created,
  noContent,
  badRequest,
  unauthorized,
  forbidden,
  notFound,
  conflict,
  serverError,
};
