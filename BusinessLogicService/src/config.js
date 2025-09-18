'use strict';

/**
 * Central configuration loader for BusinessLogicService.
 * Values come from environment variables. Do not hardcode secrets.
 * Ensure these are provided in the deployment environment or .env file.
 */
module.exports = {
  app: {
    name: process.env.APP_NAME || 'BusinessLogicService',
    env: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || '3000', 10),
    host: process.env.HOST || '0.0.0.0',
  },
  security: {
    jwtSecret: process.env.JWT_SECRET || 'CHANGE_ME_IN_PROD',
    tokenAudience: process.env.JWT_AUD || 'cyclestore-api',
    tokenIssuer: process.env.JWT_ISS || 'cyclestore-auth',
  },
  rbac: {
    // role -> permissions
    matrix: {
      admin: ['inventory:read', 'inventory:write', 'sales:write', 'customers:read', 'customers:write', 'tickets:read', 'tickets:write'],
      staff: ['inventory:read', 'sales:write', 'customers:read', 'tickets:write', 'tickets:read'],
      support: ['tickets:read', 'tickets:write', 'customers:read'],
      trainer: ['inventory:read'],
      customer: ['inventory:read', 'customers:read', 'tickets:write'],
    },
    // safe defaults for missing role mapping
    defaultPermissions: ['inventory:read'],
  },
  dataService: {
    baseUrl: process.env.DATA_SERVICE_BASE_URL || 'http://localhost:4000',
    // Timeout in ms
    timeout: parseInt(process.env.DATA_SERVICE_TIMEOUT || '10000', 10),
  },
  monitoring: {
    // future integration points for MonitoringandLoggingService
    enabled: true,
  },
};
