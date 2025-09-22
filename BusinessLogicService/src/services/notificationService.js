const axios = require('axios');

function buildClient() {
  const baseURL = process.env.NOTIFICATION_SERVICE_URL;
  if (!baseURL) {
    throw new Error('NOTIFICATION_SERVICE_URL is not configured');
  }
  const headers = {};
  if (process.env.SERVICE_AUTH_TOKEN) {
    headers.Authorization = `Bearer ${process.env.SERVICE_AUTH_TOKEN}`;
  }
  return axios.create({
    baseURL: baseURL.replace(/\/+$/, ''),
    headers,
    timeout: 10000,
  });
}

let client;
try {
  client = buildClient();
} catch (e) {
  // Defer failure until used
  client = null;
}

/**
 * PUBLIC_INTERFACE
 * sendNotification - best-effort; logs error but does not throw to avoid breaking primary flow.
 */
async function sendNotification(payload) {
  try {
    if (!client) client = buildClient();
    const res = await client.post('/notifications/send', payload);
    return res.data;
  } catch (err) {
    // Do not throw; primary workflows should continue even if notifications fail
    // eslint-disable-next-line no-console
    console.error('Notification send failed', err?.response?.data || err.message);
    return { status: 'error', details: err?.response?.data || err.message };
  }
}

module.exports = {
  sendNotification,
};
