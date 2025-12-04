import express from "express";
const router = express.Router();
import User from "../models/user.js";
import Product from "../models/product.js";
import Seller from "../models/seller.js";
import Manager from "../models/manager.js";
import Order from "../models/orders.js";
import SellProduct from "../models/SellProduct.js";
import Blog from "../models/blog.js";
import cloudinary, { upload as multerUpload } from "../config/cloudinary.js";
import jwt from "jsonwebtoken"; 

// Helpers for React-compatible API responses and basic validation
import mongoose from "mongoose";
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// --- SECRET KEY (Move to .env in production) ---
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key_change_me";

// --- MIDDLEWARE: Verify Admin Token ---
const verifyAdmin = (req, res, next) => {
  const token = req.cookies.adminToken;
  if (!token) {
    return res.status(401).json({ success: false, message: "Not authenticated", errors: { code: "NO_TOKEN" } });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== "admin") {
      return res.status(403).json({ success: false, message: "Access denied", errors: { code: "NOT_ADMIN" } });
    }
    req.admin = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: "Invalid token", errors: { code: "INVALID_TOKEN" } });
  }
};

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
  const total = items.length;
  return { items, total, page, limit };
};

// --- AUTH ROUTES ---

// 1. Check Auth (Fixes frontend "Not authenticated" loop)
router.get("/check-auth", verifyAdmin, (req, res) => {
  return sendSuccess(res, "Admin is authenticated", { user: req.admin });
});

// 2. Login Route (Renamed from /dashboard to /login)
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    
    if (!email || !password) {
      return sendError(res, 400, "Email and password are required", null, { fields: ["email", "password"] });
    }

    // --- CREDENTIALS CHECK ---
    // You MUST use these credentials to log in:
    // Email: adminLogin@gmail.com
    // Password: swiftmart
    if (email !== "adminLogin@gmail.com" || password !== "swiftmart") {
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

// 3. Logout Route
router.post("/logout", (req, res) => {
  res.clearCookie("adminToken");
  return sendSuccess(res, "Logged out successfully", {});
});


// --- PROTECTED DATA ROUTES (Added verifyAdmin) ---

// React: no server-side rendering; provide API hints instead
router.get("/blog/create", verifyAdmin, (req, res) => {
  return sendSuccess(
    res,
    "Render blog creation UI on the client. Use POST /api/v1/admin/blog to create.",
    {}
  );
});

router.get("/blogs/page", verifyAdmin, async (req, res) => {
  try {
    const blogs = await Blog.find({}).sort({ createdAt: -1 });
    return sendSuccess(res, "Blogs fetched", paginate(blogs));
  } catch (error) {
    return sendError(res, 500, "Failed to load blogs", error);
  }
});

// Create a new blog post with image upload
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
      // Write the buffer to the stream
      result.end(req.file.buffer);
      return;
    } else {
      // No image uploaded
      const blog = new Blog({ title, content, author });
      await blog.save();
      return sendCreated(res, "Blog created successfully", { blog });
    }
  } catch (error) {
    return sendError(res, 500, "Failed to create blog", error, { code: "BLOG_CREATE_FAILED" });
  }
});

// Fetch all blogs
router.get("/blogs", verifyAdmin, async (req, res) => {
  try {
    const blogs = await Blog.find({}).sort({ createdAt: -1 });
    return sendSuccess(res, "Blogs fetched", paginate(blogs));
  } catch (error) {
    return sendError(res, 500, "Failed to fetch blogs", error);
  }
});

router.get("/secondHand", verifyAdmin, async (req, res) => {
  try {
    const products = await SellProduct.find().populate("user_id", "firstname");
    return sendSuccess(res, "Second-hand products fetched", paginate(products));
  } catch (error) {
    return sendError(res, 500, "Failed to fetch second hand products", error);
  }
})

// Simple in-memory cache with TTL
const dashboardCache = {
  data: null,
  key: null,
  expiresAt: 0,
};

// --- MAIN DASHBOARD (PROTECTED) ---
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

    // Summary counts
    const [userCount, productCount, sellerCount, managerCount, orderCount] = await Promise.all([
      User.countDocuments({}),
      Product.countDocuments({}),
      Seller.countDocuments({}),
      Manager.countDocuments({}),
      Order.countDocuments({}),
    ]);

    // Revenue and orders totals
    const revenueAgg = await Order.aggregate([
      { $group: { _id: null, totalRevenue: { $sum: "$totalAmount" }, totalOrders: { $sum: 1 } } },
    ]);
    const totalRevenue = revenueAgg[0]?.totalRevenue || 0;
    const totalOrders = revenueAgg[0]?.totalOrders || 0;

    // Time range: last 30 days
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - (days - 1)); // inclusive of today

    // Helper to build daily buckets with zero fill
    const buildZeroFilledSeries = (label) => {
      const series = [];
      const cursor = new Date(start);
      while (cursor <= end) {
        let key;
        if (tz === 'local') {
          const year = cursor.getFullYear();
          const month = String(cursor.getMonth() + 1).padStart(2, '0');
          const day = String(cursor.getDate()).padStart(2, '0');
          key = `${year}-${month}-${day}`;
        } else {
          key = cursor.toISOString().slice(0, 10); // YYYY-MM-DD in UTC
        }
        series.push({ date: key, value: 0, label });
        cursor.setDate(cursor.getDate() + 1);
      }
      return series;
    };

    // Aggregate per day: users created
    const usersDaily = await User.aggregate([
      { $match: { createdAt: { $gte: start, $lte: end } } },
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);
    const productsDaily = await Product.aggregate([
      { $match: { createdAt: { $gte: start, $lte: end } } },
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);
    const ordersDaily = await Order.aggregate([
      { $match: { createdAt: { $gte: start, $lte: end } } },
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, count: { $sum: 1 }, revenue: { $sum: "$totalAmount" } } },
      { $sort: { _id: 1 } },
    ]);

    // Zero-fill series
    const usersSeries = buildZeroFilledSeries("usersCreated");
    const productsSeries = buildZeroFilledSeries("productsAdded");
    const ordersSeries = buildZeroFilledSeries("ordersCount");
    const revenueSeries = buildZeroFilledSeries("revenue");

    const mapFromAgg = (target, agg, key, field = "count") => {
      const index = Object.create(null);
      target.forEach((d, i) => (index[d.date] = i));
      agg.forEach(a => {
        const i = index[a._id];
        if (i !== undefined) target[i].value = a[field] || 0;
        target[i].label = key;
      });
      return target;
    };

    mapFromAgg(usersSeries, usersDaily, "usersCreated", "count");
    mapFromAgg(productsSeries, productsDaily, "productsAdded", "count");
    mapFromAgg(ordersSeries, ordersDaily, "ordersCount", "count");
    mapFromAgg(revenueSeries, ordersDaily.map(o => ({ _id: o._id, revenue: o.revenue })), "revenue", "revenue");

    // Top entities for quick charts
    const topProducts = await Product.find({ verified: true })
      .select("title price category image createdAt")
      .sort({ createdAt: -1 })
      .limit(10);
    const topSellers = await Seller.find({})
      .select("firstname lastname email createdAt")
      .select("firstname lastname email profileImage createdAt")
      .sort({ createdAt: -1 })
      .limit(10);

    // Category breakdown (top categories by product count)
    const categoryBreakdownAgg = await Product.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 20 },
    ]);
    const categoryBreakdown = categoryBreakdownAgg.map(c => ({ category: c._id || 'Unknown', count: c.count }));

    // Seller breakdown (orders per seller if sellerId linked in products)
    const sellerBreakdownAgg = await Product.aggregate([
      { $match: { sellerId: { $exists: true } } },
      { $group: { _id: "$sellerId", productCount: { $sum: 1 } } },
      { $sort: { productCount: -1 } },
      { $limit: 20 },
    ]);
    const sellersMap = new Map();
    const sellersInfo = await Seller.find({ _id: { $in: sellerBreakdownAgg.map(s => s._id) } }).select("firstname lastname email");
    sellersInfo.forEach(s => sellersMap.set(String(s._id), { firstname: s.firstname, lastname: s.lastname, email: s.email }));
    const sellerBreakdown = sellerBreakdownAgg.map(s => ({
      sellerId: s._id,
      productCount: s.productCount,
      seller: sellersMap.get(String(s._id)) || null,
    }));

    const data = {
      summary: {
        users: userCount,
        products: productCount,
        sellers: sellerCount,
        managers: managerCount,
        orders: orderCount,
        totalRevenue,
        totalOrders,
      },
      series: {
        usersCreated: usersSeries,
        productsAdded: productsSeries,
        ordersCount: ordersSeries,
        revenue: revenueSeries,
      },
      top: {
        products: topProducts,
        sellers: topSellers,
      },
      breakdowns: {
        categories: categoryBreakdown,
        sellers: sellerBreakdown,
      },
      window: { start: start.toISOString().slice(0,10), end: end.toISOString().slice(0,10), days, tz },
    };

    // Cache for 60 seconds per key
    dashboardCache.data = data;
    dashboardCache.key = cacheKey;
    dashboardCache.expiresAt = nowMs + 60 * 1000;

    return sendSuccess(res, "Dashboard analytics", data);
  } catch (error) {
    console.error("Dashboard Error:", error);
    return sendError(res, 500, "Error loading dashboard", error);
  }
});


router.get("/customers", verifyAdmin, async (req, res) => {
  try {
    const customers = await User.find({});
    return sendSuccess(res, "Customers fetched", paginate(customers));
  } catch (error) {
    return sendError(res, 500, "Failed to fetch customers", error);
  }
});

router.get("/api/customers", verifyAdmin, async (req, res) => {
  try {
    const customers = await User.find({});
    return sendSuccess(res, "Customers fetched", paginate(customers));
  } catch (error) {
    return sendError(res, 500, "Failed to fetch customers", error);
  }
});

router.get("/dashboard/sellproduct", verifyAdmin, async (req, res) => {
  try {
    const products = await SellProduct.find().populate("user_id", "firstname");

    const dataWithUsernames = products.map(item => ({
      id: item._id,
      username: item.user_id.firstname,
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

router.post("/dashboard/sellproduct", verifyAdmin, async (req, res) =>{
  const {id , userStatus} = req.body || {};
  try {
    if (!id || !isValidObjectId(id)) {
      return sendError(res, 400, "Valid id is required", null, { fields: ["id"] });
    }
    
    // Check if status is "Verified" and add coins if so
    const sellProduct = await SellProduct.findById(id);
    if (!sellProduct) {
        return sendError(res, 404, "Product not found", null, { code: "PRODUCT_NOT_FOUND" });
    }

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
  } catch (err) {
    console.error(err);
    return sendError(res, 500, "Error updating user status", err);
  }
})

router.get("/customer/details", verifyAdmin, async (req, res) => {
  try {
    const customers = await User.find({});
    return sendSuccess(res, "Customers fetched", paginate(customers));
  } catch (error) {
    return sendError(res, 500, "Server error", error);
  }
})

router.get("/products", verifyAdmin, async (req, res) => {
  try {
    const products = await Product.find({}).populate("sellerId");
    return sendSuccess(res, "Products fetched", paginate(products));
  } catch (error) {
    return sendError(res, 500, "Failed to fetch products", error);
  }
})

router.get("/vendors", verifyAdmin, async (req, res) => {
  try {
    const sellers = await Seller.find({});
    return sendSuccess(res, "Vendors fetched", paginate(sellers));
  } catch (error) {
    return sendError(res, 500, "Failed to fetch vendors", error);
  }
});

router.delete("/product/:id", verifyAdmin, async (req, res) => {
  try {
    const id = req.params.id;
    if (!isValidObjectId(id)) {
      return sendError(res, 400, "Invalid product id", null, { fields: ["id"] });
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
})

router.get("/api/products", verifyAdmin, async (req, res) => {
  try {
    const products = await Product.find({}).populate("sellerId");
    return sendSuccess(res, "Products fetched", paginate(products));
  } catch (error) {
    return sendError(res, 500, "Server Error", error);
  }
});

// Backward compatibility: keep old route pointing to same handler
router.get("/products/details", verifyAdmin, async (req, res) => {
  try {
    const products = await Product.find({}).populate("sellerId");
    return sendSuccess(res, "Products fetched", paginate(products));
  } catch (error) {
    return sendError(res, 500, "Server Error", error);
  }
});

router.delete("/customer/:id", verifyAdmin, async (req, res) => {
  try {
    const id = req.params.id;
    if (!isValidObjectId(id)) {
      return sendError(res, 400, "Invalid user id", null, { fields: ["id"] });
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


router.get("/product/approve/:id", verifyAdmin, async (req, res) => {
  try {
    const id = req.params.id;
    if (!isValidObjectId(id)) {
      return sendError(res, 400, "Invalid product id", null, { fields: ["id"] });
    }
    const product = await Product.findById(id);
    if (!product) {
      return sendError(res, 404, "Product not found", null, { code: "PRODUCT_NOT_FOUND" });
    }
    product.verified = true;
    await product.save();
    return sendSuccess(res, "Product approved successfully", {});
  } catch (error) {
    return sendError(res, 500, "Server Error", error);
  }
});

router.get("/product/disapprove/:id", verifyAdmin, async(req,res)=>{
  try {
    const id = req.params.id;
    if (!isValidObjectId(id)) {
      return sendError(res, 400, "Invalid product id", null, { fields: ["id"] });
    }
    const product = await Product.findById(id);
    if(!product){
      return sendError(res, 404, "No such product exists", null, { code: "PRODUCT_NOT_FOUND" });
    }
    product.verified=false;
    await product.save();
    return sendSuccess(res, "Product disapproved successfully", {});
  } catch (error) {
    return sendError(res, 500, "Server Error", error);
  }
})

router.get("/seller", verifyAdmin, async (req, res) => {
  try {
    const sellers = await Seller.find({});
    return sendSuccess(res, "Sellers fetched", paginate(sellers));
  } catch (error) {
    return sendError(res, 500, "Failed to fetch sellers", error);
  }
});

router.get("/seller/approve/:id", verifyAdmin, async (req, res) => {
  try {
    const id = req.params.id;
    if (!isValidObjectId(id)) {
      return sendError(res, 400, "Invalid seller id", null, { fields: ["id"] });
    }
    const seller = await Seller.findById(id);
    if (!seller) {
      return sendError(res, 404, "No Such user exist", null, { code: "SELLER_NOT_FOUND" });
    }
    seller.identityVerification.status = "Verified"
    await seller.save();
    return sendSuccess(res, "Seller approved successfully", {});
  } catch (error) {
    return sendError(res, 500, "Server Error", error);
  }
})

router.get("/seller/details", verifyAdmin, async (req, res) => {
  try {
    const sellers = await Seller.find({});
    return sendSuccess(res, "Seller retrieved successfully", paginate(sellers));
  } catch (error) {
    return sendError(res, 500, "Server Error", error);
  }
});

router.get("/api/sellers", verifyAdmin, async (req, res) => {
  try {
    const sellers = await Seller.find({});
    return sendSuccess(res, "Sellers fetched", paginate(sellers));
  } catch (error) {
    return sendError(res, 500, "Failed to fetch sellers", error);
  }
});

// Delete a seller by id (and optionally their products)
router.delete("/seller/:id", verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return sendError(res, 400, "Invalid seller id", null, { fields: ["id"] });
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

router.get("/manager", verifyAdmin, async (req, res) => {
  try {
    const managers = await Manager.find().select("email createdAt");
    return sendSuccess(res, "Managers fetched", paginate(managers));
  } catch (error) {
    return sendError(res, 500, "Failed to fetch managers", error);
  }
});

router.post('/create/manager', verifyAdmin, async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return sendError(res, 400, 'Email and password are required.', null, { fields: ['email','password'] });
    }

    const existingManager = await Manager.findOne({ email });
    if (existingManager) {
      return sendError(res, 409, 'Manager with this email already exists.', null, { code: 'MANAGER_EXISTS' });
    }

    const manager = new Manager({ email, password });
    await manager.save();
    return sendCreated(res, 'Manager created successfully!', {});
  } catch (error) {
    console.error('Create manager error:', error);
    return sendError(res, 500, 'Error creating manager', error);
  }
});

router.get("/order", verifyAdmin, async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate({ path: 'userId', select: 'firstname lastname email' })
      .populate({ path: 'products.productId', select: 'title image price' });
    return sendSuccess(res, 'Orders fetched', paginate(orders));
  } catch (error) {
    return sendError(res, 500, 'Failed to fetch orders', error);
  }
});

// Shared handler: group orders by user (used for both GET and POST)
async function getOrdersGrouped(req, res) {
  try {
    const orders = await Order.find({})
      .populate({
        path: 'userId',
        select: 'firstname lastname email'
      })
      .populate({
        path: 'products.productId',
        select: 'title image price'
      });

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

    // convert grouped object into array for pagination predictability
    const groupedArray = Object.values(userOrders);
    return sendSuccess(res, 'Orders grouped by user', paginate(groupedArray));
  } catch (error) {
    console.error('Error fetching orders:', error);
    return sendError(res, 500, 'Internal server error', error);
  }
}

// Replace the POST and GET routes to use the same handler
router.post("/orders", verifyAdmin, getOrdersGrouped);
router.get("/orders", verifyAdmin, getOrdersGrouped);

router.get("/orders/:userId", verifyAdmin, async (req, res) => {
  try {
    const userId = req.params.userId;
    if (!isValidObjectId(userId)) {
      return sendError(res, 400, 'Invalid user id', null, { fields: ['userId'] });
    }
    const user = await User.findById(userId).populate({
      path: 'orders',
      populate: {
        path: 'products.productId',
        model: 'Product'
      }
    });

    if (!user) {
      return sendError(res, 404, 'User not found', null, { code: 'USER_NOT_FOUND' });
    }

    return sendSuccess(res, 'User orders fetched', paginate(user.orders));
  } catch (error) {
    console.error('Error fetching user orders:', error);
    return sendError(res, 500, 'Error fetching user orders', error);
  }
});

router.put('/orders/:orderId/status', verifyAdmin, async (req, res) => {
  try {
      const { orderId } = req.params;
      const { orderStatus } = req.body;
      if (!isValidObjectId(orderId)) {
        return sendError(res, 400, 'Invalid order id', null, { fields: ['orderId'] });
      }

      // Validate order status
      const validStatuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Returned'];
      if (!validStatuses.includes(orderStatus)) {
          return sendError(res, 400, 'Invalid order status', null, { validStatuses });
      }

      // Find and update the order
      const order = await Order.findById(orderId);
      
      if (!order) {
          return sendError(res, 404, 'Order not found', null, { code: 'ORDER_NOT_FOUND' });
      }

      // Update order status
      order.orderStatus = orderStatus;
      await order.save();

      // Send success response
        return sendSuccess(res, 'Order status updated successfully', { order: { _id: order._id, orderStatus: order.orderStatus } });

  } catch (error) {
      console.error('Error updating order status:', error);
        return sendError(res, 500, 'Internal server error', error);
  }
});

// Route to fetch order user data by order ID
router.get('/orders/user/:orderId', verifyAdmin, async (req, res) => {
  try {
    const orderId = req.params.orderId;
    if (!isValidObjectId(orderId)) {
      return sendError(res, 400, 'Invalid order id', null, { fields: ['orderId'] });
    }
    
    // Find the order and populate user and product details
    const order = await Order.findById(orderId)
      .populate('userId')
      .populate({
        path: 'products.productId',
        select: 'title price image'
      });

    if (!order) {
      return sendError(res, 404, 'Order not found', null, { code: 'ORDER_NOT_FOUND' });
    }

    // Get user data with all their orders
    const userData = await User.findById(order.userId._id)
      .select('name email')
      .populate({
        path: 'orders',
        populate: {
          path: 'products.productId',
          select: 'title price image'
        }
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
    console.error('Error fetching order user data:', error);
    return sendError(res, 500, 'Internal server error', error);
  }
});

// Get all managers
router.get('/managers', verifyAdmin, async (req, res) => {
    try {
        const managers = await Manager.find().select('email createdAt');
      return sendSuccess(res, 'Managers fetched', paginate(managers));
    } catch (error) {
        console.error('Error fetching managers:', error);
      return sendError(res, 500, 'Failed to fetch managers', error);
    }
});

// Delete manager
router.delete('/managers/:id', verifyAdmin, async (req, res) => {
    try {
        const managerId = req.params.id;
        const manager = await Manager.findById(managerId);
        
        if (!manager) {
          return sendError(res, 404, 'Manager not found', null, { code: 'MANAGER_NOT_FOUND' });
        }

        await manager.deleteOne();
        
        return sendSuccess(res, 'Manager deleted successfully', {});
    } catch (error) {
        console.error('Error deleting manager:', error);
        return sendError(res, 500, 'Failed to delete manager', error);
    }
});


router.get("/delivery", verifyAdmin, async (req, res) => {
  try {
    // Placeholder for React UI; implement delivery partner model when available
    return sendSuccess(res, 'Use client UI to manage deliveries.', {});
  } catch (error) {
    console.error('Error loading delivery management:', error);
    return sendError(res, 500, 'Error loading delivery management', error);
  }
});


export default router;