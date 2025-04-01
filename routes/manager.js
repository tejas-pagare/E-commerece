import express from 'express';
import Manager from '../models/manager.js';

const router = express.Router();

// POST route to create a new manager
router.post('/create', async (req, res) => {
    const { name, email, password } = req.body;

    try {
        // Check if manager already exists
        const existingManager = await Manager.findOne({ email });
        if (existingManager) {
            return res.status(400).json({ message: 'Manager with this email already exists.' });
        }

        // Create new manager
        const manager = new Manager({ name, password });
        await manager.save();

        res.status(201).json({ message: 'Manager created successfully!' });
    } catch (error) {
        res.status(500).json({ message: 'Error creating manager', error });
    }
});

export default router; 