/**
 * Shared test helpers for route tests.
 * Provides token generators, mock factories and a reusable app builder.
 */
import jwt from 'jsonwebtoken';
import express from 'express';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';

// The JWT secret used in the actual codebase fallback
export const JWT_SECRET = 'your_jwt_secret_key_change_me';

// ─── Token Generators ──────────────────────────────────────────────

export function createAdminToken(overrides = {}) {
  return jwt.sign(
    { email: 'admin@test.com', role: 'admin', ...overrides },
    JWT_SECRET,
    { expiresIn: '1d' }
  );
}

export function createUserToken(userId, overrides = {}) {
  return jwt.sign(
    { userId, role: 'user', ...overrides },
    JWT_SECRET,
    { expiresIn: '5h' }
  );
}

export function createSellerToken(sellerId, overrides = {}) {
  return jwt.sign(
    { userId: sellerId, role: 'seller', ...overrides },
    JWT_SECRET,
    { expiresIn: '5h' }
  );
}

export function createManagerToken(managerId, overrides = {}) {
  return jwt.sign(
    { managerId, role: 'manager', ...overrides },
    JWT_SECRET,
    { expiresIn: '5h' }
  );
}

export function createRiderToken(riderId, overrides = {}) {
  return jwt.sign(
    { id: riderId, role: 'rider', ...overrides },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// ─── ObjectId Helpers ───────────────────────────────────────────────

export function fakeId() {
  return new mongoose.Types.ObjectId().toString();
}

// ─── Mock Model Factory ────────────────────────────────────────────

/**
 * Creates a mock Mongoose model with commonly used static and instance methods.
 * Returns an object that can be spread into jest.unstable_mockModule.
 */
export function createMockModel(name, overrides = {}) {
  const model = {
    find: jest.fn().mockReturnValue({ populate: jest.fn().mockReturnThis(), select: jest.fn().mockReturnThis(), sort: jest.fn().mockReturnThis(), limit: jest.fn().mockResolvedValue([]), lean: jest.fn().mockResolvedValue([]) }),
    findOne: jest.fn().mockResolvedValue(null),
    findById: jest.fn().mockReturnValue({ populate: jest.fn().mockReturnThis(), select: jest.fn().mockReturnThis(), lean: jest.fn().mockResolvedValue(null) }),
    findByIdAndUpdate: jest.fn().mockReturnValue({ select: jest.fn().mockResolvedValue(null) }),
    findByIdAndDelete: jest.fn().mockResolvedValue(null),
    findOneAndUpdate: jest.fn().mockResolvedValue(null),
    create: jest.fn().mockResolvedValue({ _id: fakeId(), save: jest.fn() }),
    countDocuments: jest.fn().mockResolvedValue(0),
    aggregate: jest.fn().mockResolvedValue([]),
    updateMany: jest.fn().mockResolvedValue({}),
    updateOne: jest.fn().mockResolvedValue({}),
    deleteMany: jest.fn().mockResolvedValue({}),
    exists: jest.fn().mockResolvedValue(null),
    distinct: jest.fn().mockResolvedValue([]),
    ...overrides,
  };
  return model;
}

// ─── Build Minimal Express App ─────────────────────────────────────

/**
 * Creates a minimal Express app for testing with body-parser & cookie-parser.
 * Usage: const app = buildApp(router, '/api/v1/admin');
 */
export function buildApp(router, prefix = '/') {
  const app = express();
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  app.use(prefix, router);
  return app;
}
