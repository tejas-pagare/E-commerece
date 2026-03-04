import jwt from "jsonwebtoken";
import Manager from "../models/manager.js";

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key_change_me";

const adminOrManagerAuth = async (req, res, next) => {
  const adminToken = req.cookies?.adminToken || null;
  const managerToken = req.cookies?.managerToken || null;

  if (!adminToken && !managerToken) {
    return res.status(401).json({
      success: false,
      message: "Not authenticated",
      errors: { code: "NO_TOKEN" },
    });
  }

  if (adminToken) {
    try {
      const decoded = jwt.verify(adminToken, JWT_SECRET);
      if (decoded.role !== "admin") {
        return res.status(403).json({
          success: false,
          message: "Access denied",
          errors: { code: "NOT_ADMIN" },
        });
      }
      req.admin = decoded;
      req.actor = { role: "admin" };
      return next();
    } catch (error) {
      // Fall through to manager token if present
    }
  }

  if (managerToken) {
    try {
      const decoded = jwt.verify(managerToken, JWT_SECRET);
      if (decoded.role !== "manager" || !decoded.managerId) {
        return res.status(403).json({
          success: false,
          message: "Access denied",
          errors: { code: "NOT_MANAGER" },
        });
      }
      const manager = await Manager.findById(decoded.managerId);
      if (!manager) {
        return res.status(401).json({
          success: false,
          message: "Manager not found",
          errors: { code: "MANAGER_NOT_FOUND" },
        });
      }
      req.manager = manager;
      req.actor = { role: "manager" };
      return next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Invalid token",
        errors: { code: "INVALID_TOKEN" },
      });
    }
  }

  return res.status(401).json({
    success: false,
    message: "Invalid token",
    errors: { code: "INVALID_TOKEN" },
  });
};

export default adminOrManagerAuth;
