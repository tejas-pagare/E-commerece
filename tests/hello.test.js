const request = require('supertest');
const app = require('../utils/createTestApp');

describe('Seller Routes', () => {
    test('GET /sellers should return a list of sellers', async () => {
        const response = await request(app).get('/sellers');
        expect(response.statusCode).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
    });

    test('POST /sellers should create a new seller', async () => {
        const newSeller = { name: 'Test Seller', email: 'test@example.com' };
        const response = await request(app).post('/sellers').send(newSeller);
        expect(response.statusCode).toBe(201);
        expect(response.body.name).toBe(newSeller.name);
    });
});