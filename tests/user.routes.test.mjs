/**
 * User Routes – Integration Tests
 *
 * The user routes delegate heavily to controller functions in controller/user.js.
 * We mock all models so the controllers run against stubs.
 */
import { describe, it, expect, beforeEach, jest } from '@jest/globals';

// ─── Mock external dependencies ────────────────────────────────────

jest.unstable_mockModule('../config/cloudinary.js', () => ({
  default: { uploader: { upload_stream: jest.fn() } },
  upload: { single: () => (req, res, next) => next(), fields: () => (req, res, next) => next() }
}));

jest.unstable_mockModule('../config/passport.js', () => ({ default: jest.fn() }));

jest.unstable_mockModule('../utils/classifier.js', () => ({
  classifyImage: jest.fn().mockResolvedValue({ is_cloth: true, category: 'T-shirt' })
}));

jest.unstable_mockModule('../utils/managerAssignment.js', () => ({
  assignUserToManager: jest.fn().mockResolvedValue(null),
  assignSellerToManager: jest.fn().mockResolvedValue(null)
}));

// Mock the blog data JSON import
jest.unstable_mockModule('../data/blogId.json', () => ({
  default: [{ id: 1, title: 'Test Blog', content: 'Content' }]
}));

// ── Mock Models ─────────────────────────────────────────────────────

const mockUser = {
  findOne: jest.fn(),
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  create: jest.fn(),
  find: jest.fn(),
};
jest.unstable_mockModule('../models/user.js', () => ({ default: mockUser }));

const mockProduct = {
  findOne: jest.fn(),
  findById: jest.fn(),
  find: jest.fn(),
};
jest.unstable_mockModule('../models/product.js', () => ({ default: mockProduct }));

const mockSeller = {
  findById: jest.fn(),
};
jest.unstable_mockModule('../models/seller.js', () => ({ default: mockSeller }));

const mockReview = {
  findById: jest.fn(),
  create: jest.fn(),
};
jest.unstable_mockModule('../models/Reviews.js', () => ({ default: mockReview }));

const mockSellProduct = {
  find: jest.fn(),
  aggregate: jest.fn().mockResolvedValue([]),
};
jest.unstable_mockModule('../models/SellProduct.js', () => ({ default: mockSellProduct }));

const mockOrder = {
  find: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
};
jest.unstable_mockModule('../models/orders.js', () => ({ default: mockOrder }));

const mockUserHistory = {
  findOne: jest.fn(),
  create: jest.fn(),
};
jest.unstable_mockModule('../models/userHistory.js', () => ({ default: mockUserHistory }));

const mockBlog = {
  findById: jest.fn(),
  find: jest.fn(),
};
jest.unstable_mockModule('../models/blog.js', () => ({ default: mockBlog }));

// ── Import helpers & router ─────────────────────────────────────────

const { createUserToken, buildApp, fakeId } = await import('./setup.mjs');
const { default: userRouter } = await import('../routes/user.js');

import supertest from 'supertest';

const app = buildApp(userRouter, '/api/v1/user');
const request = supertest(app);

const userId = fakeId();
const userToken = createUserToken(userId);
const authedGet = (url) => request.get(url).set('Cookie', [`token=${userToken}`]).set('Accept', 'application/json');
const authedPost = (url) => request.post(url).set('Cookie', [`token=${userToken}`]).set('Accept', 'application/json');
const authedDelete = (url) => request.delete(url).set('Cookie', [`token=${userToken}`]).set('Accept', 'application/json');

describe('User Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default: isAuthenticated finds the user
    mockUser.findById.mockResolvedValue({
      _id: userId,
      firstname: 'John',
      lastname: 'Doe',
      email: 'john@test.com',
      coins: 100,
      cart: [],
      products: [],
      Address: { plotno: '1', street: 'Main', city: 'City', state: 'State', pincode: 400001, phone: '1234567890' },
      save: jest.fn().mockResolvedValue(true),
      toObject: function () { return { ...this } },
    });
  });

  // ── AUTH ──────────────────────────────────────────────────────────

  describe('POST /api/v1/user/login', () => {
    it('should return 400 when fields missing', async () => {
      const res = await request.post('/api/v1/user/login')
        .set('Accept', 'application/json')
        .send({});
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 401 when user not found', async () => {
      mockUser.findOne.mockResolvedValue(null);
      const res = await request.post('/api/v1/user/login')
        .set('Accept', 'application/json')
        .send({ email: 'noone@test.com', password: 'pass' });
      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/v1/user/signup', () => {
    it('should return 400 when fields missing', async () => {
      const res = await request.post('/api/v1/user/signup')
        .set('Accept', 'application/json')
        .send({ firstname: 'John' });
      expect(res.status).toBe(400);
    });

    it('should return 409 when email already in use', async () => {
      mockUser.findOne.mockResolvedValue({ _id: fakeId() });
      const res = await request.post('/api/v1/user/signup')
        .set('Accept', 'application/json')
        .send({ firstname: 'John', lastname: 'Doe', email: 'john@test.com', password: 'pass123' });
      expect(res.status).toBe(409);
    });
  });

  describe('GET /api/v1/user/logout', () => {
    it('should return 200 and clear cookie', async () => {
      const res = await authedGet('/api/v1/user/logout');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  // ── PRODUCTS ─────────────────────────────────────────────────────

  describe('GET /api/v1/user/products', () => {
    it('should return products', async () => {
      const mockPopulate = jest.fn().mockResolvedValue([
        { _id: fakeId(), title: 'Shirt', price: 100, toObject: function () { return { ...this } } }
      ]);
      const mockLimit = jest.fn().mockReturnValue({ populate: mockPopulate });
      mockProduct.find.mockReturnValue({ limit: mockLimit });
      const res = await request.get('/api/v1/user/products');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  // ── CART ──────────────────────────────────────────────────────────

  describe('GET /api/v1/user/cart', () => {
    it('should return 401 without token', async () => {
      const res = await request.get('/api/v1/user/cart')
        .set('Accept', 'application/json');
      expect(res.status).toBe(401);
    });

    it('should return 200 with cart data', async () => {
      const mockPopulate = jest.fn().mockResolvedValue({
        _id: userId,
        cart: [],
      });
      mockUser.findById.mockReturnValue({ populate: mockPopulate });
      const res = await authedGet('/api/v1/user/cart');
      expect(res.status).toBe(200);
    });
  });

  // ── ACCOUNT DETAILS ──────────────────────────────────────────────

  describe('GET /api/v1/user/account/details', () => {
    it('should return 401 without token', async () => {
      const res = await request.get('/api/v1/user/account/details')
        .set('Accept', 'application/json');
      expect(res.status).toBe(401);
    });

    it('should return 200 with user details', async () => {
      const mockSelect = jest.fn().mockResolvedValue({
        _id: userId,
        firstname: 'John',
        lastname: 'Doe',
        email: 'john@test.com',
        coins: 100
      });
      mockUser.findById.mockReturnValue({ select: mockSelect });
      const res = await authedGet('/api/v1/user/account/details');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.user).toBeDefined();
    });
  });

  describe('POST /api/v1/user/account/update', () => {
    it('should return 400 when required fields missing', async () => {
      const res = await authedPost('/api/v1/user/account/update').send({ firstname: 'only' });
      expect(res.status).toBe(400);
    });

    it('should return 200 on successful update', async () => {
      const mockSelect = jest.fn().mockResolvedValue({
        _id: userId,
        firstname: 'Updated',
        lastname: 'User',
        email: 'updated@test.com'
      });
      mockUser.findByIdAndUpdate.mockReturnValue({ select: mockSelect });
      const res = await authedPost('/api/v1/user/account/update').send({
        firstname: 'Updated',
        lastname: 'User',
        email: 'updated@test.com'
      });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  // ── ADDRESS ──────────────────────────────────────────────────────

  describe('GET /api/v1/user/account/address/details', () => {
    it('should return address details', async () => {
      const mockSelect = jest.fn().mockResolvedValue({
        Address: { plotno: '1', street: 'Main', city: 'City', state: 'State', pincode: 400001, phone: '123' }
      });
      mockUser.findById.mockReturnValue({ select: mockSelect });
      const res = await authedGet('/api/v1/user/account/address/details');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('POST /api/v1/user/account/update/address', () => {
    it('should return 400 when fields missing', async () => {
      const res = await authedPost('/api/v1/user/account/update/address').send({ plotno: '1' });
      expect(res.status).toBe(400);
    });

    it('should return 200 on successful address update', async () => {
      mockUser.findById.mockResolvedValue({
        _id: userId,
        Address: {},
        save: jest.fn().mockResolvedValue(true)
      });
      const res = await authedPost('/api/v1/user/account/update/address').send({
        plotno: '42', street: 'Baker', city: 'London', state: 'UK', pincode: '221B', phone: '999'
      });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  // ── BLOGS ────────────────────────────────────────────────────────

  describe('GET /api/v1/user/blogs', () => {
    it('should return blogs list', async () => {
      const mockSort = jest.fn().mockResolvedValue([]);
      mockBlog.find.mockReturnValue({ sort: mockSort });
      const res = await request.get('/api/v1/user/blogs');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('GET /api/v1/user/blogs/:id', () => {
    it('should return 404 when blog not found', async () => {
      const blogId = fakeId();
      mockBlog.findById.mockResolvedValue(null);
      const res = await request.get(`/api/v1/user/blogs/${blogId}`);
      expect(res.status).toBe(404);
    });

    it('should return blog when found', async () => {
      const blogId = fakeId();
      mockBlog.findById.mockResolvedValue({ _id: blogId, title: 'Test', content: 'Content' });
      const res = await request.get(`/api/v1/user/blogs/${blogId}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  // ── FILTER ───────────────────────────────────────────────────────

  describe('GET /api/v1/user/products/filter', () => {
    it('should return filtered products', async () => {
      // filterProductsController calls Product.find(filter).populate('reviews')
      mockProduct.find.mockReturnValue({
        populate: jest.fn().mockResolvedValue([])
      });

      const res = await request.get('/api/v1/user/products/filter?category=T-shirt');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.products).toBeDefined();
    });
  });
});
