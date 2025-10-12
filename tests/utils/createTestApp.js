const express = require('express');
const request = require('supertest');

const createTestApp = () => {
    const app = express();
    // Set up your routes and middleware here
    return app;
};

module.exports = createTestApp;