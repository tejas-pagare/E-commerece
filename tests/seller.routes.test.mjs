import { jest, describe, beforeAll, beforeEach, it, expect } from '@jest/globals';
import request from 'supertest';

// ----------------- Mocks declared BEFORE importing the router -----------------
const SellerMock = jest.fn(() => ({ save: jest.fn().mockResolvedValue({}) }));
SellerMock.findOne = jest.fn();
SellerMock.findById = jest.fn();
SellerMock.findByIdAndUpdate = jest.fn();
SellerMock.findOneAndUpdate = jest.fn();

const ProductMock = {
  create: jest.fn(),
  findById: jest.fn(),
  findByIdAndDelete: jest.fn()
};

const OrderMock = { aggregate: jest.fn() };

// cloudinary uploader mock
const CloudinaryMock = {
  uploader: {
    upload_stream: (_opts, cb) => ({ end: () => cb(null, { secure_url: 'http://cdn/mock.jpg' }) })
  }
};

// Upload middleware mock (multer wrappers)
const uploadMock = {
  fields: () => (req, _res, next) => {
    if (process.env.MOCK_UPLOAD_MODE === 'missing') {
      req.files = undefined;
    } else {
      req.files = {
        profileImage: [{ buffer: Buffer.from('p') }],
        aadhaarImage: [{ buffer: Buffer.from('a') }]
      };
    }
    next();
  },
  single: () => (req, _res, next) => {
    req.file = { buffer: Buffer.from('img') };
    next();
  }
};

jest.unstable_mockModule('../middleware/isAuthenticated.js', () => ({
  default: (req, _res, next) => {
    req.userId = 'u1';
    req.role = 'seller';
    next();
  }
}));

jest.unstable_mockModule('../models/seller.js', () => ({ default: SellerMock }));
jest.unstable_mockModule('../models/product.js', () => ({ default: ProductMock }));
jest.unstable_mockModule('../models/orders.js', () => ({ default: OrderMock }));
jest.unstable_mockModule('../config/cloudinary.js', () => ({ default: CloudinaryMock, upload: uploadMock }));
jest.unstable_mockModule('bcryptjs', () => ({ default: { hash: jest.fn().mockResolvedValue('hashed') } }));
jest.unstable_mockModule('jsonwebtoken', () => ({ default: { sign: jest.fn(() => 'jwt') }, sign: jest.fn(() => 'jwt') }));
jest.unstable_mockModule('mongoose', () => {
  function ObjectId(v) {
    this.value = v;
    return v; // behave loosely for equality checks
  }
  return { default: { Types: { ObjectId } }, Types: { ObjectId } };
});

const express = (await import('express')).default;
const sellerRouter = (await import('../routes/seller.js')).default;

let app;
beforeAll(() => {
  app = express();
  app.use(express.json());
  // Convert res.render to JSON for easier assertions
  app.use((req, res, next) => {
    res.render = (view, locals) => res.status(200).json({ view, locals });
    next();
  });
  app.use('/api/v1/seller', sellerRouter);
});

beforeEach(() => {
  jest.clearAllMocks();
  delete process.env.MOCK_UPLOAD_MODE;
});

describe('Seller routes (ESM)', () => {
  it('GET /login should render login view', async () => {
    const res = await request(app).get('/api/v1/seller/login');
    expect(res.statusCode).toBe(200);
    expect(res.body.view).toBe('seller/auth/login.ejs');
    expect(res.body.locals.role).toBe('seller');
  });

  it('POST /login success -> redirect to /api/v1/seller and set cookie', async () => {
    SellerMock.findOne.mockResolvedValue({ _id: 's1' });
    const res = await request(app).post('/api/v1/seller/login').send({ email: 'a@b.com', password: 'x' });
    expect(res.statusCode).toBe(302);
    expect(res.headers.location).toBe('/api/v1/seller');
    expect(res.headers['set-cookie']).toBeDefined();
  });

  it('POST /login not found -> redirect to login', async () => {
    SellerMock.findOne.mockResolvedValue(null);
    const res = await request(app).post('/api/v1/seller/login').send({ email: 'x@y.com', password: 'x' });
    expect(res.statusCode).toBe(302);
    expect(res.headers.location).toBe('/api/v1/seller/login');
  });

  it('POST /signup missing files -> 400', async () => {
    process.env.MOCK_UPLOAD_MODE = 'missing';
    const res = await request(app).post('/api/v1/seller/signup').send({
      name: 'John', password: 'p', email: 'j@e.com', gstn: 'g', phoneNumber: '9',
      accountNumber: '1', ifscCode: 'I', bankName: 'B', storeName: 'S', street: 'st', city: 'c', state: 's', pincode: '0', country: 'IN'
    });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/Profile image/);
  });

  it('POST /signup success -> redirect to login', async () => {
    const res = await request(app).post('/api/v1/seller/signup').send({
      name: 'John', password: 'p', email: 'j@e.com', gstn: 'g', phoneNumber: '9',
      accountNumber: '1', ifscCode: 'I', bankName: 'B', storeName: 'S', street: 'st', city: 'c', state: 's', pincode: '0', country: 'IN'
    });
    expect(res.statusCode).toBe(302);
    expect(res.headers.location).toBe('/api/v1/seller/login');
  });

  it('POST /create should create product and link to seller', async () => {
    ProductMock.create.mockResolvedValue({ _id: 'p1' });
    SellerMock.findById.mockResolvedValue({ products: [], save: jest.fn().mockResolvedValue({}) });
    const res = await request(app).post('/api/v1/seller/create').send({
      title: 'T', price: 10, description: 'D', category: 'C', quantity: 1, stock: true
    });
    expect(ProductMock.create).toHaveBeenCalled();
    expect(SellerMock.findById).toHaveBeenCalledWith('u1');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('POST /update/:id updates fields and saves', async () => {
    const doc = { title: '', price: 0, description: '', image: '', quantity: 0, stock: false, save: jest.fn().mockResolvedValue({}) };
    ProductMock.findById.mockResolvedValue(doc);
    const res = await request(app).post('/api/v1/seller/update/p1').send({ title: 'N', price: 2, description: 'D', image: 'I', quantity: 3, stock: true });
    expect(ProductMock.findById).toHaveBeenCalledWith('p1');
    expect(doc.title).toBe('N');
    expect(doc.stock).toBe(true);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('DELETE /product/:id removes when owned', async () => {
    SellerMock.findById.mockResolvedValue({ products: ['p1'] });
    SellerMock.findOneAndUpdate.mockResolvedValue({});
    ProductMock.findByIdAndDelete.mockResolvedValue({});
    const res = await request(app).delete('/api/v1/seller/product/p1');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('DELETE /product/:id errors when not owned', async () => {
    SellerMock.findById.mockResolvedValue({ products: ['p2'] });
    const res = await request(app).delete('/api/v1/seller/product/p1');
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/Error in removing product/);
  });

  it('GET /account renders profile', async () => {
    SellerMock.findById.mockResolvedValue({ name: 'S' });
    const res = await request(app).get('/api/v1/seller/account');
    expect(res.statusCode).toBe(200);
    expect(res.body.view).toBe('Seller/profile/show.ejs');
  });

  it('GET / lists products', async () => {
    SellerMock.findById.mockReturnValue({ populate: jest.fn().mockResolvedValue({ products: [{ _id: 'p1' }] }) });
    const res = await request(app).get('/api/v1/seller');
    expect(res.statusCode).toBe(200);
    expect(res.body.view).toBe('seller/listedProduct/index.ejs');
  });

  it('GET /sold-products renders list', async () => {
    OrderMock.aggregate.mockResolvedValue([{ id: 'o1', name: 'I', price: 1, quantity: 1, buyerName: 'B', orderDate: '2024-01-01', status: 'Delivered', totalAmount: 1 }]);
    const res = await request(app).get('/api/v1/seller/sold-products');
    expect(res.statusCode).toBe(200);
    expect(res.body.view).toBe('seller/SoldProduct/index');
    expect(Array.isArray(res.body.locals.soldProducts)).toBe(true);
  });
});
