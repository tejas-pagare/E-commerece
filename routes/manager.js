import express from 'express';
import Manager from '../models/manager.js';
import Product from '../models/product.js';
import Seller from '../models/seller.js';
import jwt from 'jsonwebtoken';
import managerAuth from '../middleware/managerAuth.js';

const router = express.Router();

// Public route - Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide both email and password'
            });
        }

        // Find manager by email
        const manager = await Manager.findOne({ email });
        if (!manager) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Verify password
        const isPasswordValid = await manager.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Generate JWT token with enhanced security
        const tokenPayload = {
            sub: manager._id.toString(),
            email: manager.email,
            role: 'manager',
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
        };

        const token = jwt.sign(tokenPayload, process.env.JWT_SECRET);

        // Set token in HTTP-only cookie
        res.cookie('managerToken', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
        });

        // Send response without exposing token in body
        res.status(200).json({
            success: true,
            message: 'Login successful',
            manager: {
                id: manager._id,
                email: manager.email
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Protected routes - Add managerAuth middleware
router.get("/product/verify/:id", managerAuth, async (req, res) => {
  try {
    const id = req.params.id;
    const product = await Product.findById(id);
    if (!product) {
      return res.json({
        message: "No such product exists",
        success: false
      });
    }
    product.verified = true;
    await product.save();
    return res.json({
      message: "Product verified successfully",
      success: true
    });
  } catch (error) {
    return res.json({
      message: "Server Error",
      success: false
    });
  }
});

router.get("/product/reject/:id", managerAuth, async (req, res) => {
  try {
    const id = req.params.id;
    const product = await Product.findById(id);
    if (!product) {
      return res.json({
        message: "No such product exists",
        success: false
      });
    }
    product.verified = false;
    await product.save();
    return res.json({
      message: "Product rejected successfully",
      success: true
    });
  } catch (error) {
    return res.json({
      message: "Server Error",
      success: false
    });
  }
});

// Seller verification routes
router.get("/seller/verify/:id", managerAuth, async (req, res) => {
  try {
    const id = req.params.id;
    const seller = await Seller.findById(id);
    if (!seller) {
      return res.json({
        message: "No such seller exists",
        success: false
      });
    }
    seller.verified = true;
    await seller.save();
    return res.json({
      message: "Seller verified successfully",
      success: true
    });
  } catch (error) {
    return res.json({
      message: "Server Error",
      success: false
    });
  }
});

router.get("/seller/reject/:id", managerAuth, async (req, res) => {
  try {
    const id = req.params.id;
    const seller = await Seller.findById(id);
    if (!seller) {
      return res.json({
        message: "No such seller exists",
        success: false
      });
    }
    seller.verified = false;
    await seller.save();
    return res.json({
      message: "Seller rejected successfully",
      success: true
    });
  } catch (error) {
    return res.json({
      message: "Server Error",
      success: false
    });
  }
});

// Customer routes
router.get("/customers", managerAuth, async (req, res) => {
  const customers = await User.find({});
  return res.render("admin/Customers/index.ejs", { title: "Customers", role: "manager", customers });
});

router.get("/customer/details", managerAuth, async (req, res) => {
  try {
    const customers = await User.find({});
    return res.json({
      customers
    });
  } catch (error) {
    return res.json({
      message: "Server error",
      success: false
    });
  }
});

// Product routes
router.get("/products", managerAuth, (req, res) => {
  return res.render("admin/Products/index.ejs", { title: "Products", role: "manager" });
});

router.get("/products/details", managerAuth, async (req, res) => {
  try {
    const products = await Product.find({}).populate("sellerId");
    return res.json({
      products
    });
  } catch (error) {
    res.json({
      message: "Server Error",
      success: false
    });
  }
});

router.delete("/product/:id", managerAuth, async (req, res) => {
  try {
    const id = req.params.id;
    const product = await Product.findByIdAndDelete(id, { new: true });
    await Seller.findOneAndUpdate({ _id: product._id }, { $pull: { id } });
    res.json({
      message: "Product deleted successfully",
      success: true
    });
  } catch (error) {
    res.json({
      message: "Server Error",
      success: false
    });
  }
});

// Vendor route
router.get("/vendors", managerAuth, (req, res) => {
  res.render("User/Vendor/index.ejs", { title: 'Vendors', role: "manager" });
});

// Seller routes
router.get("/seller", managerAuth, (req, res) => {
  res.render("admin/Sellers/index.ejs", { title: "Sellers", role: "manager" });
});

router.get("/seller/details", managerAuth, async (req, res) => {
  try {
    const sellers = await Seller.find({});
    res.json({
      sellers,
      success: true,
      message: "Sellers retrieved Successfully"
    });
  } catch (error) {
    res.json({
      message: "Server Error",
      success: false
    });
  }
});

// Order routes
router.get("/order", managerAuth, (req, res) => {
  return res.render("admin/Orders/index.ejs", { title: "Orders", role: "manager" });
});

router.post("/orders", managerAuth, async (req, res) => {
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
      const userId = order.userId._id;
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
  
    res.json(userOrders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get("/orders/:userId", managerAuth, async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await User.findById(userId).populate({
      path: 'orders',
      populate: {
        path: 'products.productId',
        model: 'Product'
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      orders: user.orders
    });
  } catch (error) {
    console.error('Error fetching user orders:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user orders'
    });
  }
});

router.put('/orders/:orderId/status', managerAuth, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { orderStatus } = req.body;

    const validStatuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Returned'];
    if (!validStatuses.includes(orderStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order status'
      });
    }

    const order = await Order.findById(orderId);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    order.orderStatus = orderStatus;
    await order.save();

    res.status(200).json({
      success: true,
      message: 'Order status updated successfully',
      order
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router;