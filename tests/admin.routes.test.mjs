import { jest, describe, beforeAll, beforeEach, it, expect } from '@jest/globals';
import request from 'supertest';

// Mock modules BEFORE importing the router
const UserMock = { find: jest.fn() };
const ProductMock = { find: jest.fn() };

// Basic stubs for other imports to avoid runtime errors
const SellerMock = { find: jest.fn() };
const ManagerMock = { find: jest.fn(), findOne: jest.fn(), findById: jest.fn() };
const OrderMock = { find: jest.fn(), countDocuments: jest.fn() };
const SellProductMock = { find: jest.fn(), findByIdAndUpdate: jest.fn() };
const BlogMock = { find: jest.fn() };

// Cloudinary + multer upload stub
const CloudinaryMock = {
  uploader: {
    upload_stream: (_opts, cb) => ({ end: () => cb(null, { secure_url: 'http://cdn/mock.jpg' }) })
  }
};
const uploadMock = {
  single: () => (req, _res, next) => { req.file = { buffer: Buffer.from('x') }; next(); },
  fields: () => (req, _res, next) => { req.files = {}; next(); }
};

// Mongoose ObjectId validation stub
jest.unstable_mockModule('mongoose', () => ({
  default: { Types: { ObjectId: { isValid: () => true } } },
  Types: { ObjectId: { isValid: () => true } }
}));

jest.unstable_mockModule('../models/user.js', () => ({ default: UserMock }));
jest.unstable_mockModule('../models/product.js', () => ({ default: ProductMock }));
jest.unstable_mockModule('../models/seller.js', () => ({ default: SellerMock }));
jest.unstable_mockModule('../models/manager.js', () => ({ default: ManagerMock }));
jest.unstable_mockModule('../models/orders.js', () => ({ default: OrderMock }));
jest.unstable_mockModule('../models/SellProduct.js', () => ({ default: SellProductMock }));
jest.unstable_mockModule('../models/blog.js', () => ({ default: BlogMock }));
jest.unstable_mockModule('../config/cloudinary.js', () => ({ default: CloudinaryMock, upload: uploadMock }));

const express = (await import('express')).default;
const adminRouter = (await import('../routes/admin.js')).default;

let app;
beforeAll(() => {
  app = express();
  app.use(express.json());
  // In case any route still calls res.render, capture as JSON
  app.use((req, res, next) => {
    res.render = (view, locals) => res.status(200).json({ view, locals });
    next();
  });
  app.use('/api/v1/admin', adminRouter);
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe('Admin routes (React-compatible JSON)', () => {
  it('GET /api/products returns products JSON', async () => {
    ProductMock.find.mockReturnValue({
      populate: jest.fn().mockResolvedValue([
        { _id: 'p1', title: 'A' },
        { _id: 'p2', title: 'B' }
      ])
    });

    const res = await request(app).get('/api/v1/admin/api/products');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.products)).toBe(true);
    expect(res.body.products.length).toBe(2);
  });

  it('GET /customers returns users JSON', async () => {
    UserMock.find.mockResolvedValue([{ _id: 'u1' }, { _id: 'u2' }]);
    const res = await request(app).get('/api/v1/admin/customers');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.customers.length).toBe(2);
  });

  it('POST /dashboard valid creds returns success JSON', async () => {
    const res = await request(app)
      .post('/api/v1/admin/dashboard')
      .send({ email: 'adminLogin@gmail.com', password: 'swiftmart' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.redirect).toBe('/api/v1/admin/dashboard');
  });

  it('POST /dashboard invalid creds returns 401 JSON', async () => {
    const res = await request(app)
      .post('/api/v1/admin/dashboard')
      .send({ email: 'wrong@example.com', password: 'nope' });
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/Invalid credentials/);
  });
});
