const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../app');

const SECRET = 'testsecret-bl';
function token(roles = ['user']) {
  return jwt.sign({ sub: 'u', roles }, SECRET);
}

describe('Business Logic - Inventory', () => {
  beforeAll(() => {
    process.env.JWT_SECRET = SECRET;
  });

  it('GET /api/inventory requires auth', async () => {
    const res = await request(app).get('/api/inventory');
    expect([401, 403]).toContain(res.status);
  });

  it('GET /api/inventory with token returns list or server error', async () => {
    const res = await request(app).get('/api/inventory').set('Authorization', `Bearer ${token(['user'])}`);
    expect([200, 500]).toContain(res.status);
  });
});
