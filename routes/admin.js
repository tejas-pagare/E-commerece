import express from "express";
const router = express.Router();
import User from "../models/user.js";
import Product from "../models/product.js";
import Seller from "../models/seller.js";
import Manager from "../models/manager.js";
import Order from "../models/orders.js";
import SellProduct from "../models/SellProduct.js";
import Blog from "../models/blog.js";
import Industry from "../models/Industry.js";
import cloudinary, { upload as multerUpload } from "../config/cloudinary.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import verifyAdmin from "../middleware/adminAuth.js";

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key_change_me";

// Standardized response helpers
const sendSuccess = (res, message, data = {}) => {
  return res.status(200).json({ success: true, message, data, errors: null });
};
const sendCreated = (res, message, data = {}) => {
  return res.status(201).json({ success: true, message, data, errors: null });
};
const sendError = (res, status, message, error, extra = {}) => {
  return res.status(status).json({ success: false, message, data: null, errors: { message: error?.message, ...extra } });
};
const paginate = (items, page = 1, limit = 50) => {
  const total = items ? items.length : 0;
  return { items: items || [], total, page, limit };
};

// --- VIEW ROUTES (Serve EJS Pages) ---

// Login Page
router.get("/login", (req, res) => {
  // If already authenticated, redirect to dashboard
  const token = req.cookies.adminToken;
  if (token) {
    try {
      jwt.verify(token, JWT_SECRET);
      return res.redirect("/api/v1/admin/dashboard");
    } catch (e) {
      // invalid token, continue to render login
    }
  }
  res.render("admin/login/index.ejs", { title: "Admin Login", error: null });
});

// Dashboard UI (Shell for Client-Side Data Fetching)
router.get("/dashboard-view", verifyAdmin, (req, res) => {
  res.render("admin/dashboard/index.ejs", {
    title: "Admin Dashboard",
    // Pass null/zero default values to satisfy EJS variabls until client-side JS takes over
    totalCartAmount: 0,
    customerOrders: 0,
    CustomerCount: 0,
    user: req.admin
  });
});

// --- AUTH ROUTES ---

router.get("/check-auth", verifyAdmin, (req, res) => {
  return sendSuccess(res, "Admin is authenticated", { user: req.admin });
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return sendError(res, 400, "Email and password are required", null, { fields: ["email", "password"] });
    }

    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPass = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPass) {
      console.error("FATAL: ADMIN_EMAIL or ADMIN_PASSWORD not defined in environment variables.");
      return sendError(res, 500, "Server configuration error");
    }

    if (email !== adminEmail || password !== adminPass) {
      return sendError(res, 401, "Invalid credentials", null, { code: "INVALID_CREDENTIALS" });
    }

    // Generate Token
    const token = jwt.sign({ email, role: "admin" }, JWT_SECRET, { expiresIn: "1d" });

    // Set Cookie
    res.cookie("adminToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000 // 1 day
    });

    return sendSuccess(res, "Authenticated successfully", { redirect: "/api/v1/admin/dashboard" });
  } catch (error) {
    console.error(error);
    return sendError(res, 500, "Internal server error", error);
  }
});

router.post("/logout", (req, res) => {
  res.clearCookie("adminToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict"
  });
  return sendSuccess(res, "Logged out successfully", {});
});

// --- DASHBOARD ROUTE ---

// Simple in-memory cache with TTL
const dashboardCache = {
  data: null,
  key: null,
  expiresAt: 0,
};

router.get("/dashboard", verifyAdmin, async (req, res) => {
  try {
    // Query params
    const daysParam = parseInt(req.query.days, 10);
    const days = [7, 30, 90].includes(daysParam) ? daysParam : 30;
    const tz = (req.query.tz === 'local') ? 'local' : 'UTC';

    // Cache key per window and tz
    const cacheKey = `days:${days}|tz:${tz}`;
    const nowMs = Date.now();
    if (dashboardCache.key === cacheKey && dashboardCache.data && dashboardCache.expiresAt > nowMs) {
      return sendSuccess(res, "Dashboard analytics (cached)", dashboardCache.data);
    }

    // Summary counts (Use real DB data)
    const [userCount, productCount, sellerCount, managerCount, orderCount] = await Promise.all([
      User.countDocuments({}),
      Product.countDocuments({}),
      Seller.countDocuments({}),
      Manager.countDocuments({}),
      Order.countDocuments({}),
    ]);

    // Revenue and orders totals
    let totalRevenue = 0;
    let totalOrders = 0;
    try {
      const revenueAgg = await Order.aggregate([
        { $group: { _id: null, totalRevenue: { $sum: "$totalAmount" }, totalOrders: { $sum: 1 } } },
      ]);
      totalRevenue = revenueAgg[0]?.totalRevenue || 0;
      totalOrders = revenueAgg[0]?.totalOrders || 0;
    } catch (e) {
      console.error("Dashboard Revenue Aggregation Failed:", e);
    }

    // Time range: last 30 days
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - (days - 1)); // inclusive of today

    // Helper to build daily buckets with zero fill
    const buildZeroFilledSeries = (label) => {
      const series = [];
      const cursor = new Date(start);
      // Safety break to prevent infinite loops if dates are messed up
      let safety = 0;
      while (cursor <= end && safety < 1000) {
        let key;
        if (tz === 'local') {
          const year = cursor.getFullYear();
          const month = String(cursor.getMonth() + 1).padStart(2, '0');
          const day = String(cursor.getDate()).padStart(2, '0');
          key = `${year}-${month}-${day}`;
        } else {
          key = cursor.toISOString().slice(0, 10);
        }
        series.push({ date: key, value: 0, label });
        cursor.setDate(cursor.getDate() + 1);
        safety++;
      }
      return series;
    };

    // Zero-fill series
    const usersSeries = buildZeroFilledSeries("usersCreated");
    const productsSeries = buildZeroFilledSeries("productsAdded");
    const ordersSeries = buildZeroFilledSeries("ordersCount");
    const revenueSeries = buildZeroFilledSeries("revenue");

    const mapFromAgg = (target, agg, key, field = "count") => {
      const index = Object.create(null);
      target.forEach((d, i) => (index[d.date] = i));
      if (agg && Array.isArray(agg)) {
        agg.forEach(a => {
          const i = index[a._id];
          if (i !== undefined) target[i].value = a[field] || 0;
          target[i].label = key;
        });
      }
      return target;
    };

    // Execute aggregations safely
    try {
      const usersDaily = await User.aggregate([
        { $match: { createdAt: { $gte: start, $lte: end } } },
        { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]);
      mapFromAgg(usersSeries, usersDaily, "usersCreated", "count");
    } catch (e) { console.error("User aggregation failed", e); }

    try {
      const productsDaily = await Product.aggregate([
        { $match: { createdAt: { $gte: start, $lte: end } } },
        { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]);
      mapFromAgg(productsSeries, productsDaily, "productsAdded", "count");
    } catch (e) { console.error("Product aggregation failed", e); }

    try {
      const ordersDaily = await Order.aggregate([
        { $match: { createdAt: { $gte: start, $lte: end } } },
        { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, count: { $sum: 1 }, revenue: { $sum: "$totalAmount" } } },
        { $sort: { _id: 1 } },
      ]);
      mapFromAgg(ordersSeries, ordersDaily, "ordersCount", "count");
      mapFromAgg(revenueSeries, ordersDaily.map(o => ({ _id: o._id, revenue: o.revenue })), "revenue", "revenue");
    } catch (e) { console.error("Order aggregation failed", e); }


    const data = {
      summary: {
        users: userCount || 0,
        products: productCount || 0,
        sellers: sellerCount || 0,
        managers: managerCount || 0,
        orders: orderCount || 0,
        totalRevenue,
        totalOrders,
      },
      series: {
        usersCreated: usersSeries,
        productsAdded: productsSeries,
        ordersCount: ordersSeries,
        revenue: revenueSeries,
      },
      window: { start: start.toISOString().slice(0, 10), end: end.toISOString().slice(0, 10), days, tz },
    };

    // Cache results
    dashboardCache.data = data;
    dashboardCache.key = cacheKey;
    dashboardCache.expiresAt = nowMs + 60 * 1000;

    return sendSuccess(res, "Dashboard analytics", data);
  } catch (error) {
    console.error("Dashboard Error:", error);
    return sendError(res, 500, "Error loading dashboard", error);
  }
});


// --- CUSTOMER ROUTES ---

router.get("/customers", verifyAdmin, async (req, res) => {
  try {
    const customers = await User.find({});
    return sendSuccess(res, "Customers fetched", paginate(customers));
  } catch (error) {
    return sendError(res, 500, "Failed to fetch customers", error);
  }
});

router.get("/customers/:id", verifyAdmin, async (req, res) => {
  try {
    const id = req.params.id;
    if (!isValidObjectId(id) || id === 'details') {
      return sendError(res, 400, "Invalid user id");
    }
    const user = await User.findById(id);
    if (!user) return sendError(res, 404, "User not found");
    return sendSuccess(res, "User details", { user });
  } catch (error) {
    return sendError(res, 500, "Server Error", error);
  }
});

router.delete("/customers/:id", verifyAdmin, async (req, res) => {
  try {
    const id = req.params.id;
    if (!isValidObjectId(id)) {
      return sendError(res, 400, "Invalid user id");
    }
    const user = await User.findById(id);
    if (!user) {
      return sendError(res, 404, "No user with given id exists", null, { code: "USER_NOT_FOUND" });
    }

    await user.deleteOne();
    return sendSuccess(res, "User deleted successfully", {});
  } catch (error) {
    console.log(error);
    return sendError(res, 500, "Server error", error);
  }
});


// --- PRODUCT ROUTES ---

router.get("/products", verifyAdmin, async (req, res) => {
  try {
    const products = await Product.find({}).populate("sellerId");
    return sendSuccess(res, "Products fetched", paginate(products));
  } catch (error) {
    return sendError(res, 500, "Failed to fetch products", error);
  }
});

router.delete("/products/:id", verifyAdmin, async (req, res) => {
  try {
    const id = req.params.id;
    if (!isValidObjectId(id)) {
      return sendError(res, 400, "Invalid product id");
    }
    const product = await Product.findByIdAndDelete(id);
    if (!product) {
      return sendError(res, 404, "Product not found", null, { code: "PRODUCT_NOT_FOUND" });
    }
    // Best-effort detach from seller's products if such relation exists
    await Seller.updateMany({}, { $pull: { products: id } });
    return sendSuccess(res, "Product deleted successfully", {});
  } catch (error) {
    console.error("Delete product error:", error);
    return sendError(res, 500, "Server error", error);
  }
});

// Approve/Disapprove - Canonical Route
router.put("/products/:id/approval", verifyAdmin, async (req, res) => {
  try {
    const id = req.params.id;
    const { approved } = req.body;

    if (!isValidObjectId(id)) {
      return sendError(res, 400, "Invalid product id");
    }
    const product = await Product.findById(id);
    if (!product) {
      return sendError(res, 404, "Product not found", null, { code: "PRODUCT_NOT_FOUND" });
    }
    product.verified = !!approved;
    await product.save();
    return sendSuccess(res, `Product ${approved ? 'approved' : 'disapproved'} successfully`, {});
  } catch (error) {
    return sendError(res, 500, "Server Error", error);
  }
});

// Legacy backward compatibility for approvals (GET)
router.get("/product/approve/:id", verifyAdmin, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return sendError(res, 404, "Not Found");
    product.verified = true;
    await product.save();
    return sendSuccess(res, "Product approved", {});
  } catch (e) { return sendError(res, 500, "Error", e); }
});
router.get("/product/disapprove/:id", verifyAdmin, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return sendError(res, 404, "Not Found");
    product.verified = false;
    await product.save();
    return sendSuccess(res, "Product disapproved", {});
  } catch (e) { return sendError(res, 500, "Error", e); }
});


// --- SELLER ROUTES ---

router.get("/sellers", verifyAdmin, async (req, res) => {
  try {
    const sellers = await Seller.find({});
    return sendSuccess(res, "Sellers fetched", paginate(sellers));
  } catch (error) {
    return sendError(res, 500, "Failed to fetch sellers", error);
  }
});

router.delete("/sellers/:id", verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return sendError(res, 400, "Invalid seller id");
    }
    const seller = await Seller.findById(id);
    if (!seller) {
      return sendError(res, 404, "Seller not found", null, { code: "SELLER_NOT_FOUND" });
    }
    // Optional: remove products belonging to this seller
    await Product.deleteMany({ sellerId: id });
    await seller.deleteOne();
    return sendSuccess(res, "Seller deleted successfully", {});
  } catch (error) {
    console.error("Error deleting seller:", error);
    return sendError(res, 500, "Failed to delete seller", error);
  }
});

router.put("/sellers/:id/approve", verifyAdmin, async (req, res) => {
  try {
    const id = req.params.id;
    const seller = await Seller.findById(id);
    if (!seller) return sendError(res, 404, "Seller not found");
    seller.identityVerification.status = "Verified";
    await seller.save();
    return sendSuccess(res, "Seller approved", {});
  } catch (e) { return sendError(res, 500, "Error", e); }
});

// Legacy
router.get("/seller/approve/:id", verifyAdmin, async (req, res) => {
  try {
    const id = req.params.id;
    const seller = await Seller.findById(id);
    if (!seller) return sendError(res, 404, "Seller not found");
    seller.identityVerification.status = "Verified";
    await seller.save();
    return sendSuccess(res, "Seller approved", {});
  } catch (e) { return sendError(res, 500, "Error", e); }
});


// --- INDUSTRY ROUTES ---

router.get("/industries", verifyAdmin, async (req, res) => {

  try {
    const industries = await Industry.find({});
    return sendSuccess(res, "Industries fetched", paginate(industries));
  } catch (error) {
    return sendError(res, 500, "Failed to fetch industries", error);
  }
});

router.get("/industries/:id", verifyAdmin, async (req, res) => {
  try {
    const id = req.params.id;
    if (!isValidObjectId(id)) {
      return sendError(res, 400, "Invalid industry id");
    }
    const industry = await Industry.findById(id);
    if (!industry) return sendError(res, 404, "Industry not found");
    return sendSuccess(res, "Industry details", { industry });
  } catch (error) {
    return sendError(res, 500, "Server Error", error);
  }
});

router.delete("/industries/:id", verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return sendError(res, 400, "Invalid industry id");
    }
    const industry = await Industry.findById(id);
    if (!industry) {
      return sendError(res, 404, "Industry not found", null, { code: "INDUSTRY_NOT_FOUND" });
    }
    await industry.deleteOne();
    return sendSuccess(res, "Industry deleted successfully", {});
  } catch (error) {
    console.error("Error deleting industry:", error);
    return sendError(res, 500, "Failed to delete industry", error);
  }
});


// --- MANAGER ROUTES ---

router.get("/managers", verifyAdmin, async (req, res) => {
  try {
    const managers = await Manager.find().select("email createdAt");
    return sendSuccess(res, "Managers fetched", paginate(managers));
  } catch (error) {
    return sendError(res, 500, "Failed to fetch managers", error);
  }
});

router.post('/managers', verifyAdmin, async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return sendError(res, 400, 'Email and password are required.');
    }

    const existingManager = await Manager.findOne({ email });
    if (existingManager) {
      return sendError(res, 409, 'Manager already exists.');
    }

    const manager = new Manager({ email, password });
    await manager.save();
    return sendCreated(res, 'Manager created successfully!', {});
  } catch (error) {
    console.error('Create manager error:', error);
    return sendError(res, 500, 'Error creating manager', error);
  }
});
// Legacy
router.post('/create/manager', verifyAdmin, async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return sendError(res, 400, 'Email and password are required.');
    const existingManager = await Manager.findOne({ email });
    if (existingManager) return sendError(res, 409, 'Manager already exists.');
    const manager = new Manager({ email, password });
    await manager.save();
    return sendCreated(res, 'Manager created successfully!', {});
  } catch (error) { return sendError(res, 500, 'Error', error); }
});

router.delete('/managers/:id', verifyAdmin, async (req, res) => {
  try {
    const managerId = req.params.id;
    const manager = await Manager.findById(managerId);
    if (!manager) return sendError(res, 404, 'Manager not found');
    await manager.deleteOne();
    return sendSuccess(res, 'Manager deleted successfully', {});
  } catch (error) {
    return sendError(res, 500, 'Failed to delete manager', error);
  }
});


// --- ORDER ROUTES ---

// Helper function for grouping orders (reused)
async function getOrdersGrouped(req, res) {
  try {
    const orders = await Order.find({})
      .populate({ path: 'userId', select: 'firstname lastname email' })
      .populate({ path: 'products.productId', select: 'title image price' });

    const userOrders = orders.reduce((acc, order) => {
      const userId = order.userId?._id;
      if (!userId) return acc;
      if (!acc[userId]) {
        acc[userId] = {
          _id: userId,
          name: `${order.userId.firstname} ${order.userId.lastname}`,
          email: order.userId.email,
          orders: []
        };
      }
      acc[userId].orders.push({
        _id: order._id,
        orderStatus: order.orderStatus,
        totalAmount: order.totalAmount,
        paymentStatus: order.paymentStatus,
        paymentMethod: order.paymentMethod,
        products: order.products,
        shippingAddress: order.shippingAddress
      });
      return acc;
    }, {});

    const groupedArray = Object.values(userOrders);
    return sendSuccess(res, 'Orders grouped by user', paginate(groupedArray));
  } catch (error) {
    console.error('Error fetching orders:', error);
    return sendError(res, 500, 'Internal server error', error);
  }
}

router.get("/orders", verifyAdmin, getOrdersGrouped);
router.post("/orders", verifyAdmin, getOrdersGrouped); // Keep for compatibility

router.get("/orders/:userId", verifyAdmin, async (req, res) => {
  try {
    const userId = req.params.userId;
    if (!isValidObjectId(userId)) return sendError(res, 400, 'Invalid user id');

    const user = await User.findById(userId).populate({
      path: 'orders',
      populate: { path: 'products.productId', model: 'Product' }
    });

    if (!user) return sendError(res, 404, 'User not found');
    return sendSuccess(res, 'User orders fetched', paginate(user.orders));
  } catch (error) {
    return sendError(res, 500, 'Error fetching user orders', error);
  }
});

router.put('/orders/:orderId/status', verifyAdmin, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { orderStatus } = req.body;
    if (!isValidObjectId(orderId)) return sendError(res, 400, 'Invalid order id');

    const validStatuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Returned'];
    if (!validStatuses.includes(orderStatus)) return sendError(res, 400, 'Invalid order status');

    const order = await Order.findById(orderId);
    if (!order) return sendError(res, 404, 'Order not found');

    order.orderStatus = orderStatus;
    await order.save();
    return sendSuccess(res, 'Order status updated successfully', { order: { _id: order._id, orderStatus: order.orderStatus } });
  } catch (error) {
    return sendError(res, 500, 'Internal server error', error);
  }
});

router.get('/orders/user/:orderId', verifyAdmin, async (req, res) => {
  try {
    const orderId = req.params.orderId;
    if (!isValidObjectId(orderId)) return sendError(res, 400, 'Invalid order id');

    // Find the order and populate user and product details
    const order = await Order.findById(orderId)
      .populate('userId')
      .populate({ path: 'products.productId', select: 'title price image' });

    if (!order) return sendError(res, 404, 'Order not found');

    const userData = await User.findById(order.userId._id)
      .select('name email')
      .populate({
        path: 'orders',
        populate: { path: 'products.productId', select: 'title price image' }
      });

    return sendSuccess(res, 'Order user data fetched', {
      userId: userData._id,
      userData: {
        name: userData.name ?? null,
        email: userData.email,
        orders: userData.orders
      }
    });
  } catch (error) {
    return sendError(res, 500, 'Internal server error', error);
  }
});


// --- SECOND HAND / SELL PRODUCT ROUTES ---

router.get("/secondhand-products", verifyAdmin, async (req, res) => {
  try {
    const products = await SellProduct.find().populate("user_id", "firstname");

    const dataWithUsernames = products.map(item => ({
      id: item._id,
      username: item.user_id ? item.user_id.firstname : "Unknown",
      items: item.items,
      fabric: item.fabric,
      size: item.size,
      gender: item.gender,
      usageDuration: item.usageDuration,
      readableUsage: item.usageDuration > 1 ? '> 1 year' : '< 6 months',
      imageSrc: item.image?.data
        ? `data:${item.image.contentType};base64,${item.image.data.toString('base64')}`
        : null,
      clothesDate: item.clothesDate,
      timeSlot: item.timeSlot,
      userStatus: item.userStatus,
      adminStatus: item.adminStatus,
      estimated_value: item.estimated_value
    }));

    return sendSuccess(res, "Second-hand products fetched", paginate(dataWithUsernames));
  } catch (err) {
    console.error(err);
    return sendError(res, 500, 'Server Error', err);
  }
});

// Legacy Alias
router.get("/dashboard/sellproduct", verifyAdmin, async (req, res) => {
  try {
    const products = await SellProduct.find().populate("user_id", "firstname");
    const dataWithUsernames = products.map(item => ({
      id: item._id,
      username: item.user_id ? item.user_id.firstname : 'Unknown',
      items: item.items,
      fabric: item.fabric,
      size: item.size,
      gender: item.gender,
      usageDuration: item.usageDuration,
      readableUsage: item.usageDuration > 1 ? '> 1 year' : '< 6 months',
      imageSrc: item.image?.data
        ? `data:${item.image.contentType};base64,${item.image.data.toString('base64')}`
        : null,
      clothesDate: item.clothesDate,
      timeSlot: item.timeSlot,
      userStatus: item.userStatus,
      adminStatus: item.adminStatus,
      estimated_value: item.estimated_value
    }));
    return sendSuccess(res, "Second-hand products fetched", paginate(dataWithUsernames));
  } catch (err) { return sendError(res, 500, 'Server Error', err); }
});

router.put("/secondhand-products/:id/status", verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!isValidObjectId(id)) {
      return sendError(res, 400, "Invalid product id");
    }

    const validStatuses = ["Pending", "Verified", "Rejected"];
    if (!status || !validStatuses.includes(status)) {
      return sendError(res, 400, "Invalid status provided", null, { validStatuses });
    }

    const sellProduct = await SellProduct.findById(id);
    if (!sellProduct) {
      return sendError(res, 404, "Product not found");
    }

    if (status === "Verified" && sellProduct.userStatus !== "Verified") {
      const userId = sellProduct.user_id;
      const coinsToAdd = sellProduct.estimated_value || 0;
      if (userId && coinsToAdd > 0) {
        if (isValidObjectId(userId)) {
          await User.findByIdAndUpdate(userId, { $inc: { coins: coinsToAdd } });
        }
      }
    }

    sellProduct.userStatus = status;
    await sellProduct.save();

    return sendSuccess(res, "Status updated", { sellProduct });
  } catch (error) {
    console.error("Error updating second-hand product status:", error);
    return sendError(res, 500, "Internal server error", error);
  }
});

// Legacy POST for update
router.post("/dashboard/sellproduct", verifyAdmin, async (req, res) => {
  const { id, userStatus } = req.body || {};
  try {
    if (!id || !isValidObjectId(id)) return sendError(res, 400, "Valid id is required");
    const sellProduct = await SellProduct.findById(id);
    if (!sellProduct) return sendError(res, 404, "Product not found");

    if (userStatus === "Verified" && sellProduct.userStatus !== "Verified") {
      const userId = sellProduct.user_id;
      const coinsToAdd = sellProduct.estimated_value;
      if (userId && coinsToAdd) {
        await User.findByIdAndUpdate(userId, { $inc: { coins: coinsToAdd } });
      }
    }
    sellProduct.userStatus = userStatus;
    await sellProduct.save();
    return sendSuccess(res, "User status updated", {});
  } catch (err) { return sendError(res, 500, "Error", err); }
});

router.put("/sellproduct/:id/status", verifyAdmin, async (req, res) => { // Legacy
  res.redirect(307, `/api/v1/admin/secondhand-products/${req.params.id}/status`);
});


// --- BLOG ROUTES ---

router.get("/blogs", verifyAdmin, async (req, res) => {
  try {
    const blogs = await Blog.find({}).sort({ createdAt: -1 });
    return sendSuccess(res, "Blogs fetched", paginate(blogs));
  } catch (error) {
    return sendError(res, 500, "Failed to fetch blogs", error);
  }
});

router.post("/blog", verifyAdmin, multerUpload.single("image"), async (req, res) => {
  try {
    const { title, content, author } = req.body;
    let imageUrl = "";
    if (req.file) {
      // Upload image to Cloudinary
      const result = await cloudinary.uploader.upload_stream({ resource_type: "image" }, async (error, result) => {
        if (error) throw error;
        imageUrl = result.secure_url;
        const blog = new Blog({ title, content, author, image: imageUrl });
        await blog.save();
        return sendCreated(res, "Blog created successfully", { blog });
      });
      result.end(req.file.buffer);
      return;
    } else {
      const blog = new Blog({ title, content, author });
      await blog.save();
      return sendCreated(res, "Blog created successfully", { blog });
    }
  } catch (error) {
    return sendError(res, 500, "Failed to create blog", error);
  }
});

router.get("/delivery", verifyAdmin, async (req, res) => {
  return sendSuccess(res, 'Use client UI to manage deliveries.', {});
});


// --- ANALYTICS ROUTES ---

router.get("/analytics/products", verifyAdmin, async (req, res) => {
  try {
    const { period } = req.query;

    // Validate and set time period
    const validPeriods = {
      '3m': 3,
      '6m': 6,
      '1y': 12
    };

    const months = validPeriods[period] || 3; // Default to 3 months

    // Calculate start date based on period
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    // Aggregation pipeline to get product analytics
    const productAnalytics = await Order.aggregate([
      // Filter orders within the time period
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      // Unwind products array to analyze individual products
      {
        $unwind: "$products"
      },
      // Group by product to calculate metrics
      {
        $group: {
          _id: "$products.productId",
          totalQuantity: { $sum: "$products.quantity" },
          totalRevenue: { $sum: { $multiply: ["$products.price", "$products.quantity"] } },
          orderCount: { $sum: 1 }
        }
      },
      // Sort by total quantity purchased (descending)
      {
        $sort: { totalQuantity: -1 }
      },
      // Limit to top 20 products
      {
        $limit: 20
      },
      // Lookup product details
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "productDetails"
        }
      },
      // Unwind product details
      {
        $unwind: {
          path: "$productDetails",
          preserveNullAndEmptyArrays: true
        }
      },
      // Filter out products with missing required fields
      {
        $match: {
          "productDetails.image": { $exists: true, $ne: null, $ne: "" },
          "productDetails.category": { $exists: true, $ne: null, $ne: "" },
          "productDetails.price": { $exists: true, $ne: null }
        }
      },
      // Project final structure
      {
        $project: {
          _id: 0,
          productId: "$_id",
          title: "$productDetails.title",
          category: "$productDetails.category",
          price: "$productDetails.price",
          image: "$productDetails.image",
          totalQuantity: 1,
          totalRevenue: { $round: ["$totalRevenue", 2] },
          orderCount: 1
        }
      }
    ]);

    return sendSuccess(res, "Product analytics fetched successfully", {
      analytics: productAnalytics,
      period: period || '3m',
      periodLabel: months === 3 ? 'Last 3 Months' : months === 6 ? 'Last 6 Months' : 'Last 1 Year',
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      totalProducts: productAnalytics.length
    });
  } catch (error) {
    console.error("Product Analytics Error:", error);
    return sendError(res, 500, "Failed to fetch product analytics", error);
  }
});

router.get("/analytics/users/:userId/purchases", verifyAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const { period } = req.query;

    // Validate userId
    if (!isValidObjectId(userId)) {
      return sendError(res, 400, "Invalid user id", null, { code: "INVALID_USER_ID" });
    }

    // Verify user exists
    const user = await User.findById(userId).select("firstname lastname email");
    if (!user) {
      return sendError(res, 404, "User not found", null, { code: "USER_NOT_FOUND" });
    }

    // Validate and set time period
    const validPeriods = {
      '3m': 3,
      '6m': 6,
      '1y': 12,
      'lifetime': null
    };

    const months = validPeriods.hasOwnProperty(period) ? validPeriods[period] : 3;
    const activePeriod = validPeriods.hasOwnProperty(period) ? period : '3m';

    // Calculate date range
    const endDate = new Date();
    let startDate = null;
    if (months !== null) {
      startDate = new Date();
      startDate.setMonth(startDate.getMonth() - months);
    }

    // Build match stage
    const matchStage = {
      userId: new mongoose.Types.ObjectId(userId)
    };
    if (startDate) {
      matchStage.createdAt = { $gte: startDate, $lte: endDate };
    }

    // Aggregation pipeline for category breakdown
    const categoryAnalytics = await Order.aggregate([
      { $match: matchStage },
      { $unwind: "$products" },
      {
        $lookup: {
          from: "products",
          localField: "products.productId",
          foreignField: "_id",
          as: "productDetails"
        }
      },
      {
        $unwind: {
          path: "$productDetails",
          preserveNullAndEmptyArrays: false
        }
      },
      // Filter out products with missing category
      {
        $match: {
          "productDetails.category": { $exists: true, $ne: null, $ne: "" }
        }
      },
      // Group by category
      {
        $group: {
          _id: "$productDetails.category",
          totalQuantity: { $sum: "$products.quantity" },
          totalRevenue: { $sum: { $multiply: ["$products.price", "$products.quantity"] } },
          orderCount: { $sum: 1 },
          products: {
            $addToSet: {
              productId: "$products.productId",
              title: "$productDetails.title",
              image: "$productDetails.image"
            }
          }
        }
      },
      { $sort: { totalQuantity: -1 } },
      {
        $project: {
          _id: 0,
          category: "$_id",
          totalQuantity: 1,
          totalRevenue: { $round: ["$totalRevenue", 2] },
          orderCount: 1,
          uniqueProducts: { $size: "$products" },
          topProducts: { $slice: ["$products", 5] }
        }
      }
    ]);

    // Summary stats
    const totalQuantity = categoryAnalytics.reduce((sum, c) => sum + c.totalQuantity, 0);
    const totalRevenue = categoryAnalytics.reduce((sum, c) => sum + c.totalRevenue, 0);
    const totalOrders = categoryAnalytics.reduce((sum, c) => sum + c.orderCount, 0);

    const periodLabels = {
      '3m': 'Last 3 Months',
      '6m': 'Last 6 Months',
      '1y': 'Last 1 Year',
      'lifetime': 'Lifetime'
    };

    return sendSuccess(res, "User purchase analytics fetched successfully", {
      user: {
        _id: user._id,
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email
      },
      categoryBreakdown: categoryAnalytics,
      summary: {
        totalCategories: categoryAnalytics.length,
        totalQuantity,
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        totalOrders,
        mostPurchasedCategory: categoryAnalytics.length > 0 ? categoryAnalytics[0].category : null
      },
      period: activePeriod,
      periodLabel: periodLabels[activePeriod],
      startDate: startDate ? startDate.toISOString().split('T')[0] : null,
      endDate: endDate.toISOString().split('T')[0]
    });
  } catch (error) {
    console.error("User Purchase Analytics Error:", error);
    return sendError(res, 500, "Failed to fetch user purchase analytics", error);
  }
});

// --- PERFORMANCE RANKINGS ---

// Helper: build date range from period param
function buildDateRange(period) {
  const periodMap = { '3m': 3, '6m': 6, '12m': 12, 'lifetime': null };
  const months = periodMap.hasOwnProperty(period) ? periodMap[period] : 3;
  const activePeriod = periodMap.hasOwnProperty(period) ? period : '3m';
  const endDate = new Date();
  let startDate = null;
  if (months !== null) {
    startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);
  }
  return { startDate, endDate, activePeriod };
}

// Helper: date format string for aggregation interval
function dateFormatForInterval(interval) {
  switch (interval) {
    case 'day': return '%Y-%m-%d';
    case 'week': return '%Y-W%V';
    case 'month': return '%Y-%m';
    default: return '%Y-%m';
  }
}

// 1. Seller Rankings
router.get("/analytics/rankings/sellers", verifyAdmin, async (req, res) => {
  try {
    const { period, metric } = req.query;
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 100);
    const { startDate, endDate, activePeriod } = buildDateRange(period);
    const sortMetric = metric === 'orders' ? 'totalOrders' : 'totalValue';

    const matchStage = {};
    if (startDate) matchStage.createdAt = { $gte: startDate, $lte: endDate };

    const pipeline = [
      { $match: matchStage },
      { $unwind: "$products" },
      {
        $lookup: {
          from: "products",
          localField: "products.productId",
          foreignField: "_id",
          as: "productInfo"
        }
      },
      { $unwind: { path: "$productInfo", preserveNullAndEmptyArrays: false } },
      {
        $group: {
          _id: "$productInfo.sellerId",
          totalValue: { $sum: { $multiply: ["$products.price", "$products.quantity"] } },
          totalOrders: { $sum: 1 },
          uniqueBuyers: { $addToSet: "$userId" }
        }
      },
      {
        $addFields: {
          avgOrderValue: { $cond: [{ $gt: ["$totalOrders", 0] }, { $divide: ["$totalValue", "$totalOrders"] }, 0] },
          uniqueBuyers: { $size: "$uniqueBuyers" }
        }
      },
      { $sort: { [sortMetric]: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: "sellers",
          localField: "_id",
          foreignField: "_id",
          as: "sellerInfo"
        }
      },
      { $unwind: { path: "$sellerInfo", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 0,
          sellerId: "$_id",
          sellerName: { $ifNull: ["$sellerInfo.storeName", "$sellerInfo.name"] },
          totalValue: { $round: ["$totalValue", 2] },
          totalOrders: 1,
          avgOrderValue: { $round: ["$avgOrderValue", 2] },
          uniqueBuyers: 1
        }
      }
    ];

    const results = await Order.aggregate(pipeline);

    // Add rank
    const ranked = results.map((item, i) => ({ rank: i + 1, ...item }));

    return sendSuccess(res, "Seller rankings fetched", {
      period: activePeriod,
      metric: metric === 'orders' ? 'orders' : 'value',
      generatedAt: new Date().toISOString(),
      data: ranked
    });
  } catch (error) {
    console.error("Seller Rankings Error:", error);
    return sendError(res, 500, "Failed to fetch seller rankings", error);
  }
});

// 2. Industry Rankings
router.get("/analytics/rankings/industries", verifyAdmin, async (req, res) => {
  try {
    const { period, metric } = req.query;
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 100);
    const { startDate, endDate, activePeriod } = buildDateRange(period);
    const sortMetric = metric === 'orders' ? 'totalOrders' : 'totalValue';

    // Build match for dashboard.date
    const dashboardMatch = {};
    if (startDate) {
      dashboardMatch["dashboard.date"] = { $gte: startDate, $lte: endDate };
    }

    const pipeline = [
      // Only include industries that have dashboard entries
      { $match: { "dashboard.0": { $exists: true } } },
      { $unwind: "$dashboard" },
    ];

    // Filter by date if not lifetime
    if (startDate) {
      pipeline.push({ $match: { "dashboard.date": { $gte: startDate, $lte: endDate } } });
    }

    pipeline.push(
      {
        $group: {
          _id: "$_id",
          companyName: { $first: "$companyName" },
          totalValue: { $sum: "$dashboard.amount" },
          totalOrders: { $sum: 1 },
          totalQuantity: { $sum: "$dashboard.quantity" }
        }
      },
      {
        $addFields: {
          avgOrderValue: { $cond: [{ $gt: ["$totalOrders", 0] }, { $divide: ["$totalValue", "$totalOrders"] }, 0] },
          activeBuyers: 1 // Each industry is one buyer entity
        }
      },
      { $sort: { [sortMetric]: -1 } },
      { $limit: limit },
      {
        $project: {
          _id: 0,
          industryId: "$_id",
          industry: "$companyName",
          totalValue: { $round: ["$totalValue", 2] },
          totalOrders: 1,
          activeBuyers: 1,
          avgOrderValue: { $round: ["$avgOrderValue", 2] }
        }
      }
    );

    const results = await Industry.aggregate(pipeline);
    const ranked = results.map((item, i) => ({ rank: i + 1, ...item }));

    return sendSuccess(res, "Industry rankings fetched", {
      period: activePeriod,
      metric: metric === 'orders' ? 'orders' : 'value',
      generatedAt: new Date().toISOString(),
      data: ranked
    });
  } catch (error) {
    console.error("Industry Rankings Error:", error);
    return sendError(res, 500, "Failed to fetch industry rankings", error);
  }
});

// 3. Seller Performance Timeseries
router.get("/analytics/sellers/:sellerId/timeseries", verifyAdmin, async (req, res) => {
  try {
    const { sellerId } = req.params;
    const { period, metric } = req.query;
    const interval = ['day', 'week', 'month'].includes(req.query.interval) ? req.query.interval : 'month';

    if (!isValidObjectId(sellerId)) {
      return sendError(res, 400, "Invalid seller id", null, { code: "INVALID_SELLER_ID" });
    }

    const seller = await Seller.findById(sellerId).select("name storeName");
    if (!seller) return sendError(res, 404, "Seller not found", null, { code: "SELLER_NOT_FOUND" });

    const { startDate, endDate, activePeriod } = buildDateRange(period);
    const dateFormat = dateFormatForInterval(interval);
    const valueField = metric === 'orders' ? 'orderCount' : 'totalValue';

    // Get all product IDs for this seller
    const sellerProductIds = await Product.find({ sellerId: new mongoose.Types.ObjectId(sellerId) }).distinct("_id");

    const matchStage = {
      "products.productId": { $in: sellerProductIds }
    };
    if (startDate) matchStage.createdAt = { $gte: startDate, $lte: endDate };

    const pipeline = [
      { $match: matchStage },
      { $unwind: "$products" },
      { $match: { "products.productId": { $in: sellerProductIds } } },
      {
        $group: {
          _id: { $dateToString: { format: dateFormat, date: "$createdAt" } },
          totalValue: { $sum: { $multiply: ["$products.price", "$products.quantity"] } },
          orderCount: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          _id: 0,
          date: "$_id",
          value: metric === 'orders' ? "$orderCount" : { $round: ["$totalValue", 2] }
        }
      }
    ];

    const points = await Order.aggregate(pipeline);

    return sendSuccess(res, "Seller timeseries fetched", {
      sellerId,
      sellerName: seller.storeName || seller.name,
      metric: metric === 'orders' ? 'orders' : 'value',
      interval,
      period: activePeriod,
      points
    });
  } catch (error) {
    console.error("Seller Timeseries Error:", error);
    return sendError(res, 500, "Failed to fetch seller timeseries", error);
  }
});

// 4. Industry Performance Timeseries
router.get("/analytics/industries/:industryId/timeseries", verifyAdmin, async (req, res) => {
  try {
    const { industryId } = req.params;
    const { period, metric } = req.query;
    const interval = ['day', 'week', 'month'].includes(req.query.interval) ? req.query.interval : 'month';

    if (!isValidObjectId(industryId)) {
      return sendError(res, 400, "Invalid industry id", null, { code: "INVALID_INDUSTRY_ID" });
    }

    const industry = await Industry.findById(industryId).select("companyName dashboard");
    if (!industry) return sendError(res, 404, "Industry not found", null, { code: "INDUSTRY_NOT_FOUND" });

    const { startDate, endDate, activePeriod } = buildDateRange(period);
    const dateFormat = dateFormatForInterval(interval);

    const matchStage = { _id: new mongoose.Types.ObjectId(industryId), "dashboard.0": { $exists: true } };

    const pipeline = [
      { $match: matchStage },
      { $unwind: "$dashboard" },
    ];

    if (startDate) {
      pipeline.push({ $match: { "dashboard.date": { $gte: startDate, $lte: endDate } } });
    }

    pipeline.push(
      {
        $group: {
          _id: { $dateToString: { format: dateFormat, date: "$dashboard.date" } },
          totalValue: { $sum: "$dashboard.amount" },
          orderCount: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          _id: 0,
          date: "$_id",
          value: metric === 'orders' ? "$orderCount" : { $round: ["$totalValue", 2] }
        }
      }
    );

    const points = await Industry.aggregate(pipeline);

    return sendSuccess(res, "Industry timeseries fetched", {
      industryId,
      industry: industry.companyName,
      metric: metric === 'orders' ? 'orders' : 'value',
      interval,
      period: activePeriod,
      points
    });
  } catch (error) {
    console.error("Industry Timeseries Error:", error);
    return sendError(res, 500, "Failed to fetch industry timeseries", error);
  }
});

export default router;
