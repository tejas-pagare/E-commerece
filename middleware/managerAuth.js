import jwt from 'jsonwebtoken';
import Manager from '../models/manager.js';

const extractToken = (req) => {
    const authHeader = req.header('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
        return authHeader.replace('Bearer ', '').trim();
    }
    return req.cookies?.managerToken || null;
};

const managerAuth = async (req, res, next) => {
    try {
        const token = extractToken(req);

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'No token, authorization denied'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'JWT_SECRET');

        if (!decoded.managerId || decoded.role !== 'manager') {
            return res.status(401).json({
                success: false,
                message: 'Invalid token, authorization denied'
            });
        }

        const manager = await Manager.findById(decoded.managerId);
        if (!manager) {
            return res.status(401).json({
                success: false,
                message: 'Manager not found'
            });
        }

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