'use strict';

/**
 * Centralized configuration for BusinessLogicService.
 * Values are sourced from environment variables; ensure .env is populated by orchestrator.
 * Do not hardcode secrets or URLs here; use environment variables and defaults only.
 */
const config = {
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT ? Number(process.env.PORT) : 4001,
  host: process.env.HOST || '0.0.0.0',

  // Downstream service base URLs (must be provided by environment/.env)
  dataServiceBaseUrl: process.env.DATA_SERVICE_BASE_URL || 'http://localhost:3001/api/v1',
  notificationServiceBaseUrl: process.env.NOTIFICATION_SERVICE_BASE_URL || 'http://localhost:3003/api/v1',

  // Auth (if forwarding bearer token)
  forwardAuthHeader: true,

  // Request timeouts/retries
  httpTimeoutMs: process.env.HTTP_TIMEOUT_MS ? Number(process.env.HTTP_TIMEOUT_MS) : 8000,
  httpRetries: process.env.HTTP_RETRIES ? Number(process.env.HTTP_RETRIES) : 2,

  // Observability toggles
  logLevel: process.env.LOG_LEVEL || 'info',
};

module.exports = config;
