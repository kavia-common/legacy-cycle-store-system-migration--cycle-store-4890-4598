'use strict';

const LEVELS = ['debug', 'info', 'warn', 'error'];

function log(level, message, context = {}) {
  if (!LEVELS.includes(level)) level = 'info';
  const payload = {
    ts: new Date().toISOString(),
    level,
    message,
    ...context,
  };
  // eslint-disable-next-line no-console
  console[level === 'warn' ? 'warn' : (level === 'error' ? 'error' : 'log')](JSON.stringify(payload));
}

module.exports = {
  debug: (msg, ctx) => log('debug', msg, ctx),
  info: (msg, ctx) => log('info', msg, ctx),
  warn: (msg, ctx) => log('warn', msg, ctx),
  error: (msg, ctx) => log('error', msg, ctx),
};
