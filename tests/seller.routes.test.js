const request = require('supertest');
const app = require('../utils/createTestApp');

describe('Seller Routes', () => {
    it('should create a new seller', async () => {
        const response = await request(app)
            .post('/api/sellers')
            .send({ name: 'Test Seller', email: 'test@example.com' });
        expect(response.statusCode).toBe(201);
        expect(response.body).toHaveProperty('id');
    });

    it('should get a list of sellers', async () => {
        const response = await request(app).get('/api/sellers');
        expect(response.statusCode).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
    });

    it('should get a seller by id', async () => {
        const response = await request(app).get('/api/sellers/1');
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('id', 1);
    });

    it('should update a seller', async () => {
        const response = await request(app)
            .put('/api/sellers/1')
            .send({ name: 'Updated Seller' });
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('name', 'Updated Seller');
    });

    it('should delete a seller', async () => {
        const response = await request(app).delete('/api/sellers/1');
        expect(response.statusCode).toBe(204);
    });
});