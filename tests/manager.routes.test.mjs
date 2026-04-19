/**
 * Manager Routes – Integration Tests
 */
import { describe, it, expect, beforeEach, jest } from '@jest/globals';

// ─── Mock Models ────────────────────────────────────────────────────

const mockManager = {
  findOne: jest.fn(),
  find: jest.fn(),
  findById: jest.fn(),
};
jest.unstable_mockModule('../models/manager.js', () => ({ default: mockManager }));

const mockProduct = {
  findById: jest.fn(),
  find: jest.fn(),
  countDocuments: jest.fn().mockResolvedValue(0),
};
jest.unstable_mockModule('../models/product.js', () => ({ default: mockProduct }));

const mockSeller = {
  find: jest.fn(),
  findById: jest.fn(),
  countDocuments: jest.fn().mockResolvedValue(0),
};
jest.unstable_mockModule('../models/seller.js', () => ({ default: mockSeller }));

const mockUser = {
  find: jest.fn(),
  exists: jest.fn(),
};
jest.unstable_mockModule('../models/user.js', () => ({ default: mockUser }));

const mockOrder = {
  find: jest.fn(),
  findById: jest.fn(),
};
jest.unstable_mockModule('../models/orders.js', () => ({ default: mockOrder }));

// ── Import helpers & router ─────────────────────────────────────────

const { buildApp, fakeId } = await import('./setup.mjs');
const { default: managerRouter } = await import('../routes/manager.js');

import supertest from 'supertest';

const app = buildApp(managerRouter, '/api/v1/manager');
const request = supertest(app);

describe('Manager Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ── AUTH ──────────────────────────────────────────────────────────

  describe('POST /api/v1/manager/login', () => {
    it('should return 400 when manager not found', async () => {
      mockManager.findOne.mockResolvedValue(null);
      const res = await request.post('/api/v1/manager/login').send({
        email: 'noone@test.com',
        password: 'pass123'
      });
      expect(res.status).toBe(400);
    });

    it('should return 400 when password is invalid', async () => {
      mockManager.findOne.mockResolvedValue({
        _id: fakeId(),
        email: 'mgr@test.com',
        comparePassword: jest.fn().mockReturnValue(false)
      });
      const res = await request.post('/api/v1/manager/login').send({
        email: 'mgr@test.com',
        password: 'wrongpass'
      });
      expect(res.status).toBe(400);
    });

    it('should return 200 with token on valid login', async () => {
      mockManager.findOne.mockResolvedValue({
        _id: fakeId(),
        email: 'mgr@test.com',
        comparePassword: jest.fn().mockReturnValue(true)
      });
      const res = await request.post('/api/v1/manager/login').send({
        email: 'mgr@test.com',
        password: 'password123'
      });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
    });
  });

  // ── PRODUCT VERIFICATION ─────────────────────────────────────────

  describe('GET /api/v1/manager/product/verify/:id', () => {
    it('should return error when product not found', async () => {
      const id = fakeId();
      mockProduct.findById.mockResolvedValue(null);
      const res = await request.get(`/api/v1/manager/product/verify/${id}`);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/no such product/i);
    });

    it('should verify product successfully', async () => {
      const id = fakeId();
      mockProduct.findById.mockResolvedValue({
        _id: id,
        verified: false,
        save: jest.fn().mockResolvedValue(true)
      });
      const res = await request.get(`/api/v1/manager/product/verify/${id}`);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toMatch(/verified/i);
    });
  });

  describe('GET /api/v1/manager/product/reject/:id', () => {
    it('should reject product successfully', async () => {
      const id = fakeId();
      mockProduct.findById.mockResolvedValue({
        _id: id,
        verified: true,
        save: jest.fn().mockResolvedValue(true)
      });
      const res = await request.get(`/api/v1/manager/product/reject/${id}`);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toMatch(/rejected/i);
    });
  });

  // ── SELLER VERIFICATION ──────────────────────────────────────────

  describe('GET /api/v1/manager/seller/verify/:id', () => {
    it('should return error when seller not found', async () => {
      const id = fakeId();
      mockSeller.findById.mockResolvedValue(null);
      const res = await request.get(`/api/v1/manager/seller/verify/${id}`);
      expect(res.body.success).toBe(false);
    });

    it('should verify seller successfully', async () => {
      const id = fakeId();
      mockSeller.findById.mockResolvedValue({
        _id: id,
        identityVerification: { status: 'Pending' },
        save: jest.fn().mockResolvedValue(true)
      });
      const res = await request.get(`/api/v1/manager/seller/verify/${id}`);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toMatch(/verified/i);
    });
  });

  describe('GET /api/v1/manager/seller/reject/:id', () => {
    it('should reject seller successfully', async () => {
      const id = fakeId();
      mockSeller.findById.mockResolvedValue({
        _id: id,
        identityVerification: { status: 'Pending' },
        save: jest.fn().mockResolvedValue(true)
      });
      const res = await request.get(`/api/v1/manager/seller/reject/${id}`);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toMatch(/rejected/i);
    });
  });

  // ── CUSTOMER DETAILS ─────────────────────────────────────────────

  describe('GET /api/v1/manager/customer/details', () => {
    it('should return customers', async () => {
      mockUser.find.mockResolvedValue([{ _id: fakeId(), firstname: 'John' }]);
      const res = await request.get('/api/v1/manager/customer/details');
      expect(res.status).toBe(200);
      expect(res.body.customers).toBeDefined();
    });
  });

  // ── PRODUCTS DATA ────────────────────────────────────────────────

  describe('GET /api/v1/manager/products/details', () => {
    it('should return products', async () => {
      const mockPopulate = jest.fn().mockResolvedValue([]);
      mockProduct.find.mockReturnValue({ populate: mockPopulate });
      const res = await request.get('/api/v1/manager/products/details');
      expect(res.status).toBe(200);
      expect(res.body.products).toBeDefined();
    });
  });

  // ── SELLER DATA ──────────────────────────────────────────────────

  describe('GET /api/v1/manager/seller/details', () => {
    it('should return sellers', async () => {
      mockSeller.find.mockResolvedValue([]);
      const res = await request.get('/api/v1/manager/seller/details');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  // ── SELLER STATS ─────────────────────────────────────────────────

  describe('GET /api/v1/manager/sellers/stats', () => {
    it('should return seller statistics', async () => {
      mockSeller.countDocuments.mockResolvedValue(10);
      const res = await request.get('/api/v1/manager/sellers/stats');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body).toHaveProperty('total');
      expect(res.body).toHaveProperty('pending');
      expect(res.body).toHaveProperty('verified');
    });
  });

  // ── PENDING / VERIFIED SELLERS ───────────────────────────────────

  describe('GET /api/v1/manager/sellers/pending', () => {
    it('should return pending sellers', async () => {
      const mockSort = jest.fn().mockResolvedValue([]);
      const mockSelect = jest.fn().mockReturnValue({ sort: mockSort });
      mockSeller.find.mockReturnValue({ select: mockSelect });
      const res = await request.get('/api/v1/manager/sellers/pending');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('GET /api/v1/manager/sellers/verified', () => {
    it('should return verified sellers', async () => {
      const mockSort = jest.fn().mockResolvedValue([]);
      const mockSelect = jest.fn().mockReturnValue({ sort: mockSort });
      mockSeller.find.mockReturnValue({ select: mockSelect });
      const res = await request.get('/api/v1/manager/sellers/verified');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  // ── PRODUCT STATS ────────────────────────────────────────────────

  describe('GET /api/v1/manager/products/stats', () => {
    it('should return product statistics', async () => {
      mockProduct.countDocuments.mockResolvedValue(20);
      const res = await request.get('/api/v1/manager/products/stats');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  // ── PENDING / VERIFIED PRODUCTS ──────────────────────────────────

  describe('GET /api/v1/manager/products/pending', () => {
    it('should return pending products', async () => {
      const mockSort = jest.fn().mockResolvedValue([]);
      const mockPopulate = jest.fn().mockReturnValue({ sort: mockSort });
      mockProduct.find.mockReturnValue({ populate: mockPopulate });
      const res = await request.get('/api/v1/manager/products/pending');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('GET /api/v1/manager/products/verified', () => {
    it('should return verified products', async () => {
      const mockSort = jest.fn().mockResolvedValue([]);
      const mockPopulate = jest.fn().mockReturnValue({ sort: mockSort });
      mockProduct.find.mockReturnValue({ populate: mockPopulate });
      const res = await request.get('/api/v1/manager/products/verified');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  // ── PRODUCT VERIFY / REJECT (POST) ──────────────────────────────

  describe('POST /api/v1/manager/product/verify/:id', () => {
    it('should return 404 when product not found', async () => {
      const id = fakeId();
      mockProduct.findById.mockResolvedValue(null);
      const res = await request.post(`/api/v1/manager/product/verify/${id}`);
      expect(res.status).toBe(404);
    });

    it('should verify product', async () => {
      const id = fakeId();
      mockProduct.findById.mockResolvedValue({
        _id: id,
        verified: false,
        save: jest.fn().mockResolvedValue(true)
      });
      const res = await request.post(`/api/v1/manager/product/verify/${id}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('POST /api/v1/manager/product/reject/:id', () => {
    it('should reject product', async () => {
      const id = fakeId();
      mockProduct.findById.mockResolvedValue({
        _id: id,
        verified: true,
        save: jest.fn().mockResolvedValue(true)
      });
      const res = await request.post(`/api/v1/manager/product/reject/${id}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  // ── ORDERS ───────────────────────────────────────────────────────

  describe('GET /api/v1/manager/orders/:userId', () => {
    it('should return 400 for invalid userId', async () => {
      const res = await request.get('/api/v1/manager/orders/invalid-id');
      expect(res.status).toBe(400);
    });

    it('should return 404 when user not found', async () => {
      const userId = fakeId();
      mockUser.exists.mockResolvedValue(null);
      const res = await request.get(`/api/v1/manager/orders/${userId}`);
      expect(res.status).toBe(404);
    });

    it('should return 200 with user orders', async () => {
      const userId = fakeId();
      mockUser.exists.mockResolvedValue({ _id: userId });
      const mockPopulate = jest.fn().mockResolvedValue([]);
      mockOrder.find.mockReturnValue({ populate: mockPopulate });
      const res = await request.get(`/api/v1/manager/orders/${userId}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('PUT /api/v1/manager/orders/:orderId/status', () => {
    it('should return 400 for invalid status', async () => {
      const orderId = fakeId();
      const res = await request.put(`/api/v1/manager/orders/${orderId}/status`).send({ orderStatus: 'BadStatus' });
      expect(res.status).toBe(400);
    });

    it('should return 404 when order not found', async () => {
      const orderId = fakeId();
      mockOrder.findById.mockResolvedValue(null);
      const res = await request.put(`/api/v1/manager/orders/${orderId}/status`).send({ orderStatus: 'Shipped' });
      expect(res.status).toBe(404);
    });

    it('should return 200 on successful status update', async () => {
      const orderId = fakeId();
      mockOrder.findById.mockResolvedValue({
        _id: orderId,
        orderStatus: 'Pending',
        save: jest.fn().mockResolvedValue(true)
      });
      const res = await request.put(`/api/v1/manager/orders/${orderId}/status`).send({ orderStatus: 'Shipped' });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});
