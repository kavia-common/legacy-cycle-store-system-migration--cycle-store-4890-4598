'use strict';

const http = require('http');
const https = require('https');
const { URL } = require('url');
const config = require('./config');

/**
 * Simple fetch-like client built on Node http/https with timeout and retry.
 * This avoids adding external deps and keeps control on headers for auth forwarding.
 */
async function request(method, url, { headers = {}, body = undefined, timeout = config.httpTimeoutMs, retries = config.httpRetries } = {}) {
  const parsed = new URL(url);
  const isHttps = parsed.protocol === 'https:';
  const lib = isHttps ? https : http;

  const options = {
    method,
    hostname: parsed.hostname,
    port: parsed.port || (isHttps ? 443 : 80),
    path: `${parsed.pathname}${parsed.search}`,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  };

  const attempt = () =>
    new Promise((resolve, reject) => {
      const req = lib.request(options, (res) => {
        const chunks = [];
        res.on('data', (d) => chunks.push(d));
        res.on('end', () => {
          const text = Buffer.concat(chunks).toString('utf8');
          let payload = text;
          try {
            payload = text ? JSON.parse(text) : null;
          } catch {
            // keep text
          }
          const result = { status: res.statusCode, headers: res.headers, data: payload };
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(result);
          } else {
            const err = new Error(`HTTP ${res.statusCode}`);
            err.response = result;
            reject(err);
          }
        });
      });

      req.on('error', reject);
      req.setTimeout(timeout, () => {
        req.destroy(new Error('ETIMEDOUT'));
      });

      if (body !== undefined) {
        const data = typeof body === 'string' ? body : JSON.stringify(body);
        req.write(data);
      }
      req.end();
    });

  let attemptNum = 0;
  while (true) {
    try {
      return await attempt();
    } catch (err) {
      attemptNum += 1;
      const retriable = ['ETIMEDOUT', 'ECONNRESET', 'EAI_AGAIN', 'ENETUNREACH'].includes(err.code) || (err.response && err.response.status >= 500);
      if (!retriable || attemptNum > retries) {
        throw err;
      }
      await new Promise((r) => setTimeout(r, 150 * attemptNum));
    }
  }
}

// PUBLIC_INTERFACE
function get(url, opts) {
  /** Perform HTTP GET with retry and timeout. */
  return request('GET', url, opts);
}

// PUBLIC_INTERFACE
function post(url, opts) {
  /** Perform HTTP POST with retry and timeout. */
  return request('POST', url, opts);
}

// PUBLIC_INTERFACE
function put(url, opts) {
  /** Perform HTTP PUT with retry and timeout. */
  return request('PUT', url, opts);
}

// PUBLIC_INTERFACE
function del(url, opts) {
  /** Perform HTTP DELETE with retry and timeout. */
  return request('DELETE', url, opts);
}

module.exports = { request, get, post, put, del };
