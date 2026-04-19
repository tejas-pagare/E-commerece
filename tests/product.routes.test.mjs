/**
 * Product Routes – Integration Tests
 */
import { describe, it, expect, beforeEach, jest } from '@jest/globals';

// ─── Mock Models ────────────────────────────────────────────────────

const mockProduct = {
  findById: jest.fn(),
  find: jest.fn(),
};
jest.unstable_mockModule('../models/product.js', () => ({ default: mockProduct }));

// ── Import helpers & router ─────────────────────────────────────────

const { buildApp, fakeId } = await import('./setup.mjs');
const { default: productRouter } = await import('../routes/product.js');

import supertest from 'supertest';

const app = buildApp(productRouter, '/api/v1/product');

// Override the EJS-rendering route to avoid template errors
// We only test the /details/:id JSON API route
const request = supertest(app);

describe('Product Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/v1/product/details/:id', () => {
    it('should return 404 when product not found', async () => {
      const id = fakeId();
      const mockPopulate1 = jest.fn().mockReturnThis();
      const mockPopulate2 = jest.fn().mockResolvedValue(null);
      mockProduct.findById.mockReturnValue({
        populate: jest.fn().mockReturnValue({ populate: mockPopulate2 })
      });

      const res = await request.get(`/api/v1/product/details/${id}`);
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('should return 200 with product and related products', async () => {
      const id = fakeId();
      const sellerId = fakeId();

      const productDoc = {
        _id: id,
        title: 'Test Shirt',
        price: 100,
        category: 'T-shirt',
        sellerId: { storeName: 'TestStore' },
        reviews: [],
        toObject: function () {
          return { _id: this._id, title: this.title, price: this.price, category: this.category, sellerId: this.sellerId, reviews: this.reviews };
        }
      };

      // findById chain: .populate().populate()
      mockProduct.findById.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockResolvedValue(productDoc)
        })
      });

      // find for related products
      const relatedProduct = {
        _id: fakeId(),
        title: 'Related Shirt',
        price: 80,
        category: 'T-shirt',
        toObject: function () {
          return { _id: this._id, title: this.title, price: this.price, category: this.category };
        }
      };

      mockProduct.find.mockReturnValue({
        limit: jest.fn().mockResolvedValue([relatedProduct])
      });

      const res = await request.get(`/api/v1/product/details/${id}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.product).toBeDefined();
      expect(res.body.product.title).toBe('Test Shirt');
      // Price should be marked up by 1.1
      expect(res.body.product.price).toBe(Math.ceil(100 * 1.1));
      expect(res.body.relatedProducts).toBeDefined();
      expect(res.body.relatedProducts).toHaveLength(1);
    });

    it('should return 500 on server error', async () => {
      const id = fakeId();
      mockProduct.findById.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockRejectedValue(new Error('DB Error'))
        })
      });

      const res = await request.get(`/api/v1/product/details/${id}`);
      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
    });
  });
});
