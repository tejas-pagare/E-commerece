import path from 'path';
import { fileURLToPath } from 'url';
import request from 'supertest';
import { jest } from '@jest/globals';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Resolve model files exactly as used by routes/admin.js
const userModelPath = path.resolve(__dirname, '..', 'models', 'user.js');
const productModelPath = path.resolve(__dirname, '..', 'models', 'product.js');

// Mock ESM modules before importing the app
await jest.unstable_mockModule(userModelPath, () => ({
  default: { find: jest.fn() }
}));
await jest.unstable_mockModule(productModelPath, () => ({
  default: { find: jest.fn() }
}));

// Import app and mocked modules after mocks are set up
const { default: app } = await import('../utils/createTestApp.js');
const { default: User } = await import(userModelPath);
const { default: Product } = await import(productModelPath);

describe('Admin Routes (ESM)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET /api/v1/admin/api/customers should return customers list', async () => {
    User.find.mockResolvedValue([
      { _id: 'u1', firstname: 'John' },
      { _id: 'u2', firstname: 'Jane' }
    ]);

    const res = await request(app).get('/api/v1/admin/api/customers');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('success', true);
    expect(Array.isArray(res.body.customers)).toBe(true);
    expect(res.body.customers.length).toBe(2);
  });

  it('GET /api/v1/admin/api/products should return products list', async () => {
    Product.find.mockReturnValue({
      populate: jest.fn().mockResolvedValue([
        { _id: 'p1', title: 'P1' },
        { _id: 'p2', title: 'P2' }
      ])
    });

    const res = await request(app).get('/api/v1/admin/api/products');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('success', true);
    expect(Array.isArray(res.body.products)).toBe(true);
    expect(res.body.products.length).toBe(2);
  });

  it('POST /api/v1/admin/dashboard should redirect on valid credentials', async () => {
    const res = await request(app)
      .post('/api/v1/admin/dashboard')
      .send({ email: 'adminLogin@gmail.com', password: 'swiftmart' });

    expect(res.status).toBe(302);
    expect(res.headers.location).toBe('/api/v1/admin/dashboard');
  });

  it('POST /api/v1/admin/dashboard should redirect to user login on invalid credentials', async () => {
    const res = await request(app)
      .post('/api/v1/admin/dashboard')
      .send({ email: 'wrong@example.com', password: 'wrongpass' });

    expect(res.status).toBe(302);
    expect(res.headers.location).toBe('/api/v1/user/login');
  });
});
