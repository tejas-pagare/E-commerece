import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key_change_me";

const verifyAdmin = (req, res, next) => {
  const token = req.cookies.adminToken;

  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: "Not authenticated", 
      errors: { code: "NO_TOKEN" } 
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== "admin") {
      return res.status(403).json({ 
        success: false, 
        message: "Access denied", 
        errors: { code: "NOT_ADMIN" } 
      });
    }
    req.admin = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ 
      success: false, 
      message: "Invalid token", 
      errors: { code: "INVALID_TOKEN" } 
    });
  }
};

export default verifyAdmin;
