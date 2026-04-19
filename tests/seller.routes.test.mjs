/**
 * Seller Routes – Integration Tests
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

// ── Mock Models ─────────────────────────────────────────────────────

const mockSeller = {
  findOne: jest.fn(),
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  find: jest.fn(),
  create: jest.fn(),
};
jest.unstable_mockModule('../models/seller.js', () => ({ default: mockSeller }));

const mockProduct = {
  findOne: jest.fn(),
  findById: jest.fn(),
  findByIdAndDelete: jest.fn(),
  create: jest.fn(),
  find: jest.fn(),
};
jest.unstable_mockModule('../models/product.js', () => ({ default: mockProduct }));

const mockUser = {
  findById: jest.fn(),
  findOne: jest.fn(),
};
jest.unstable_mockModule('../models/user.js', () => ({ default: mockUser }));

const mockOrder = {
  find: jest.fn(),
  findById: jest.fn(),
  aggregate: jest.fn().mockResolvedValue([]),
};
jest.unstable_mockModule('../models/orders.js', () => ({ default: mockOrder }));

// ── Import helpers & router ─────────────────────────────────────────

const { createSellerToken, buildApp, fakeId } = await import('./setup.mjs');
const { default: sellerRouter } = await import('../routes/seller.js');

import supertest from 'supertest';
import bcrypt from 'bcryptjs';

const app = buildApp(sellerRouter, '/api/v1/seller');
const request = supertest(app);

const sellerId = fakeId();
const sellerToken = createSellerToken(sellerId);
const authedGet = (url) => request.get(url).set('Cookie', [`token=${sellerToken}`]);
const authedPost = (url) => request.post(url).set('Cookie', [`token=${sellerToken}`]);
const authedPut = (url) => request.put(url).set('Cookie', [`token=${sellerToken}`]);
const authedPatch = (url) => request.patch(url).set('Cookie', [`token=${sellerToken}`]);
const authedDelete = (url) => request.delete(url).set('Cookie', [`token=${sellerToken}`]);

describe('Seller Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default: isAuthenticated finds the seller
    mockSeller.findById.mockResolvedValue({
      _id: sellerId,
      name: 'Test Seller',
      email: 'seller@test.com',
      storeName: 'Test Store',
      gstn: 'GST123',
      password: 'hashed',
      products: [],
      toObject: function () { return { ...this } },
      save: jest.fn().mockResolvedValue(true),
    });
  });

  // ── AUTH ──────────────────────────────────────────────────────────

  describe('GET /api/v1/seller/login', () => {
    it('should return 200 with login info', async () => {
      const res = await request.get('/api/v1/seller/login');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('POST /api/v1/seller/login', () => {
    it('should return 400 when email/password missing', async () => {
      const res = await request.post('/api/v1/seller/login').send({});
      expect(res.status).toBe(400);
    });

    it('should return 401 when seller not found', async () => {
      mockSeller.findOne.mockResolvedValue(null);
      const res = await request.post('/api/v1/seller/login').send({
        email: 'noone@test.com',
        password: 'password'
      });
      expect(res.status).toBe(401);
    });

    it('should return 401 when password does not match', async () => {
      const hashedPw = await bcrypt.hash('realpassword', 10);
      mockSeller.findOne.mockResolvedValue({
        _id: sellerId,
        email: 'seller@test.com',
        password: hashedPw,
        toObject: function () { return { ...this } },
      });
      const res = await request.post('/api/v1/seller/login').send({
        email: 'seller@test.com',
        password: 'wrongpassword'
      });
      expect(res.status).toBe(401);
    });

    it('should return 200 with valid credentials', async () => {
      const hashedPw = await bcrypt.hash('password123', 10);
      mockSeller.findOne.mockResolvedValue({
        _id: sellerId,
        email: 'seller@test.com',
        password: hashedPw,
        toObject: function () { return { _id: sellerId, email: 'seller@test.com' } },
      });
      const res = await request.post('/api/v1/seller/login').send({
        email: 'seller@test.com',
        password: 'password123'
      });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toMatch(/login successful/i);
    });
  });

  describe('GET /api/v1/seller/logout', () => {
    it('should return 200 and clear cookie', async () => {
      const res = await authedGet('/api/v1/seller/logout');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  // ── PRODUCTS ─────────────────────────────────────────────────────

  describe('GET /api/v1/seller/products', () => {
    it('should return 401 without token', async () => {
      const res = await request.get('/api/v1/seller/products')
        .set('Accept', 'application/json');
      expect(res.status).toBe(401);
    });

    it('should return 200 with seller products', async () => {
      const populateMock = jest.fn().mockResolvedValue({ products: [{ _id: fakeId(), title: 'Shirt' }] });
      mockSeller.findById.mockReturnValue({ populate: populateMock });
      const res = await authedGet('/api/v1/seller/products');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('GET /api/v1/seller/product/:id', () => {
    it('should return 404 when product not found', async () => {
      const id = fakeId();
      mockProduct.findById.mockResolvedValue(null);
      const res = await authedGet(`/api/v1/seller/product/${id}`);
      expect(res.status).toBe(404);
    });

    it('should return 403 when seller does not own the product', async () => {
      const id = fakeId();
      const otherSellerId = fakeId();
      mockProduct.findById.mockResolvedValue({
        _id: id,
        sellerId: otherSellerId,
        title: 'Other Product'
      });
      const res = await authedGet(`/api/v1/seller/product/${id}`);
      expect(res.status).toBe(403);
    });

    it('should return 200 when seller owns the product', async () => {
      const id = fakeId();
      mockProduct.findById.mockResolvedValue({
        _id: id,
        sellerId: sellerId,
        title: 'My Product'
      });
      const res = await authedGet(`/api/v1/seller/product/${id}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.product.title).toBe('My Product');
    });
  });

  describe('POST /api/v1/seller/update/:id', () => {
    it('should return 200 on successful update', async () => {
      const id = fakeId();
      mockProduct.findById.mockResolvedValue({
        _id: id,
        title: 'Old Title',
        price: 100,
        description: 'Old desc',
        save: jest.fn().mockResolvedValue(true)
      });
      const res = await authedPost(`/api/v1/seller/update/${id}`).send({
        title: 'New Title',
        price: 200
      });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('DELETE /api/v1/seller/product/:id', () => {
    it('should return error when product not in seller list', async () => {
      const id = fakeId();
      mockSeller.findById.mockResolvedValue({
        _id: sellerId,
        products: [],
        toObject: function () { return { ...this } },
      });
      const res = await authedDelete(`/api/v1/seller/product/${id}`);
      expect(res.body.message).toMatch(/error/i);
    });

    it('should return 200 on successful deletion', async () => {
      const productId = fakeId();
      const mockSellerFindOneAndUpdate = jest.fn().mockResolvedValue({});
      mockSeller.findById.mockResolvedValue({
        _id: sellerId,
        products: [productId],
        toObject: function () { return { ...this } },
      });
      mockSeller.findOneAndUpdate = mockSellerFindOneAndUpdate;
      mockProduct.findByIdAndDelete.mockResolvedValue({});

      const res = await authedDelete(`/api/v1/seller/product/${productId}`);
      expect(res.body.success).toBe(true);
    });
  });

  // ── ACCOUNT ──────────────────────────────────────────────────────

  describe('GET /api/v1/seller/account/me', () => {
    it('should return 200 with seller details', async () => {
      mockSeller.findById.mockResolvedValue({
        _id: sellerId,
        name: 'Test Seller',
        email: 'seller@test.com',
        password: 'hashed',
        toObject: function () { return { _id: this._id, name: this.name, email: this.email, password: this.password } },
      });
      const res = await authedGet('/api/v1/seller/account/me');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.seller).toBeDefined();
      expect(res.body.seller.password).toBeUndefined(); // Password should be stripped
    });
  });

  describe('PATCH /api/v1/seller/account', () => {
    it('should return 400 when no updatable fields provided', async () => {
      const res = await authedPatch('/api/v1/seller/account').send({});
      expect(res.status).toBe(400);
    });

    it('should return 200 on successful partial update', async () => {
      mockSeller.findByIdAndUpdate.mockResolvedValue({
        _id: sellerId,
        name: 'Updated Name',
        email: 'seller@test.com',
        password: 'hashed',
        toObject: function () { return { _id: this._id, name: this.name, email: this.email, password: this.password } },
      });
      const res = await authedPatch('/api/v1/seller/account').send({ name: 'Updated Name' });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('POST /api/v1/seller/account/update', () => {
    it('should return 400 when required fields missing', async () => {
      const res = await authedPost('/api/v1/seller/account/update').send({ name: 'Only Name' });
      expect(res.status).toBe(400);
    });

    it('should return 200 on successful update', async () => {
      mockSeller.findByIdAndUpdate.mockResolvedValue({});
      const res = await authedPost('/api/v1/seller/account/update').send({
        name: 'New Name',
        email: 'new@test.com',
        gstn: 'GSTNEW'
      });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  // ── SOLD PRODUCTS ────────────────────────────────────────────────

  describe('GET /api/v1/seller/sold-products/data', () => {
    it('should return 200 with sold products', async () => {
      mockOrder.aggregate.mockResolvedValue([]);
      const res = await authedGet('/api/v1/seller/sold-products/data');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.soldProducts).toBeDefined();
    });
  });

  // ── ORDER REQUESTS ───────────────────────────────────────────────

  describe('GET /api/v1/seller/orders/requests', () => {
    it('should return 200 with order requests', async () => {
      mockOrder.aggregate.mockResolvedValue([]);
      const res = await authedGet('/api/v1/seller/orders/requests');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  // ── ORDER STATUS UPDATE ──────────────────────────────────────────

  describe('PUT /api/v1/seller/orders/:orderId/seller/status', () => {
    it('should return 400 for invalid orderId', async () => {
      const res = await authedPut('/api/v1/seller/orders/bad/seller/status').send({ orderStatus: 'Shipped' });
      expect(res.status).toBe(400);
    });

    it('should return 400 for invalid orderStatus', async () => {
      const orderId = fakeId();
      const res = await authedPut(`/api/v1/seller/orders/${orderId}/seller/status`).send({ orderStatus: 'BadStatus' });
      expect(res.status).toBe(400);
    });

    it('should return 404 when order not found', async () => {
      const orderId = fakeId();
      const mockPopulate = jest.fn().mockResolvedValue(null);
      mockOrder.findById.mockReturnValue({ populate: mockPopulate });
      const res = await authedPut(`/api/v1/seller/orders/${orderId}/seller/status`).send({ orderStatus: 'Shipped' });
      expect(res.status).toBe(404);
    });

    it('should return 403 when seller has no items in order', async () => {
      const orderId = fakeId();
      const otherSellerId = fakeId();
      const mockPopulate = jest.fn().mockResolvedValue({
        _id: orderId,
        products: [{ productId: { _id: fakeId(), sellerId: otherSellerId }, quantity: 1 }],
        orderStatus: 'Pending',
        save: jest.fn(),
      });
      mockOrder.findById.mockReturnValue({ populate: mockPopulate });
      const res = await authedPut(`/api/v1/seller/orders/${orderId}/seller/status`).send({ orderStatus: 'Shipped' });
      expect(res.status).toBe(403);
    });

    it('should return 200 on successful status update', async () => {
      const orderId = fakeId();
      const productId = fakeId();
      const mockPopulate = jest.fn().mockResolvedValue({
        _id: orderId,
        products: [{
          productId: { _id: productId, sellerId: sellerId, title: 'Shirt', image: 'img.jpg' },
          quantity: 2,
          price: 500,
          sellerPrice: 450,
        }],
        orderStatus: 'Pending',
        totalAmount: 1000,
        shippingAddress: { fullname: 'John' },
        userId: fakeId(),
        save: jest.fn().mockResolvedValue(true),
      });
      mockOrder.findById.mockReturnValue({ populate: mockPopulate });

      const res = await authedPut(`/api/v1/seller/orders/${orderId}/seller/status`).send({ orderStatus: 'Shipped' });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.order.orderStatus).toBe('Shipped');
    });
  });
});
