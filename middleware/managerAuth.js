import jwt from 'jsonwebtoken';
import Manager from '../models/manager.js';

const managerAuth = async (req, res, next) => {
    try {
        // Get token from header
        const token = req.header('Authorization');
        
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'No token, authorization denied'
            });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Check if it's a manager token
        if (!decoded.managerId || decoded.role !== 'manager') {
            return res.status(401).json({
                success: false,
                message: 'Invalid token, authorization denied'
            });
        }

        // Find manager
        const manager = await Manager.findById(decoded.managerId);
        if (!manager) {
            return res.status(401).json({
                success: false,
                message: 'Manager not found'
            });
        }

        // Add manager to request object
        req.manager = manager;
        next();
    } catch (error) {
        res.status(401).json({
            success: false,
            message: 'Token is not valid'
        });
    }
};

export default managerAuth;