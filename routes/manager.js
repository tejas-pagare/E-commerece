import express from 'express';
import Manager from '../models/manager.js';
import Product from '../models/product.js';
import Seller from '../models/seller.js';
import jwt from 'jsonwebtoken';
import managerAuth from '../middleware/managerAuth.js';

const router = express.Router();

// Public route - Login
const loginController = async (req, res) => {
    try {
      console.log("POst login")
        const { email, password } = req.body;

        // Find manager by email
        const manager = await Manager.findOne({ email });
        if (!manager) {
            return res.status(400).json({
              message:"Error"
            })
        }

        // Verify password
        const isPasswordValid = await manager.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(400).json({
              message:"Error"
            })
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: manager._id, role: "manager" },
            process.env.JWT_SECRET||"SECRET",
            { expiresIn: "5h" }
        );

        // Set token in cookie
        res.cookie("managerToken", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 3600000, // 1 hour
        });

        res.json({
          success:"ture"
        })

    } catch (error) {
        console.error('Login error:', error);
        res.status(400).json({
          message:"Error"
        })
    }
};

router.get('/login', (req, res) => {
  console.log("Hii")
  res.render('manager/login/index.ejs', { 
      title: 'Manager Login',
      error: null ,
      role:"manager"
  });
  return;
});
// Replace the existing login route with the controller
router.post('/login', loginController);
// Render login page

// Protected routes - Add managerAuth middleware
router.get("/product/verify/:id",  async (req, res) => {
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

router.get("/product/reject/:id",  async (req, res) => {
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
router.get("/seller/verify/:id",  async (req, res) => {
  try {
    console.log("Hii")
    const id = req.params.id;
    const seller = await Seller.findById(id);
    if (!seller) {
      return res.json({
        message: "No such seller exists",
        success: false
      });
    }
     seller.identityVerification.status = "Verified"
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

router.get("/seller/reject/:id",  async (req, res) => {
  try {
    const id = req.params.id;
    const seller = await Seller.findById(id);
    if (!seller) {
      return res.json({
        message: "No such seller exists",
        success: false
      });
    }
      seller.identityVerification.status = "Reject"
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
router.get("/customers",  async (req, res) => {
  const customers = await User.find({});
  return res.render("admin/Customers/index.ejs", { title: "Customers", role: "manager", customers });
});

router.get("/customer/details",  async (req, res) => {
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
router.get("/products",  (req, res) => {
  return res.render("admin/Products/index.ejs", { title: "Products", role: "manager" });
});

router.get("/products/details",  async (req, res) => {
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

router.delete("/product/:id",  async (req, res) => {
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
router.get("/vendors",  (req, res) => {
  res.render("User/Vendor/index.ejs", { title: 'Vendors', role: "manager" });
});

// Seller routes
router.get("/sellers",  async (req, res) => {
  try {
    // Get all sellers with their verification status
    const [totalSellers, pendingSellers, verifiedSellers] = await Promise.all([
      Seller.countDocuments(),
      Seller.find({ "identityVerification.status": "Pending" }).sort({ createdAt: -1 }),
      Seller.find({ "identityVerification.status": "Verified" }).sort({ updatedAt: -1 })
    ]);
console.log(pendingSellers)
    res.render("manager/seller/index.ejs", { 
      title: "Seller Verification", 
      role: "manager",
      totalSellers,
      pendingSellers,
      verifiedSellers
    });
  } catch (error) {
    console.error('Error fetching sellers:', error);
    res.status(500).render("manager/seller/index.ejs", {
      title: "Seller Verification",
      role: "manager",
      error: "Failed to load seller data",
      totalSellers: 0,
      pendingSellers: [],
      verifiedSellers: [],
      role:"manager"
    });
  }
});

router.get("/seller/details",  async (req, res) => {
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
router.get("/order",  (req, res) => {
  return res.render("admin/Orders/index.ejs", { title: "Orders", role: "manager" });
});

router.post("/orders",  async (req, res) => {
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

router.get("/orders/:userId",  async (req, res) => {
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

router.put('/orders/:orderId/status',  async (req, res) => {
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



// Render home/dashboard page with required data
router.get('/',  async (req, res) => {
    try {
        // Get counts for pending items
     

        res.render('manager/home/index.ejs', {
            title: 'Manager Dashboard',
            role:"manager       "
        });
    } catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).render('manager/home/index.ejs', {
            title: 'Manager Dashboard',
            error: 'Failed to load dashboard data'
        });
    }
});

// Get pending sellers
router.get("/sellers/pending", async (req, res) => {
  try {
    const pendingSellers = await Seller.find({ "identityVerification.status": "Pending" })
      .select('name storeName email gstn createdAt address identityVerification profileImage')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      sellers: pendingSellers
    });
  } catch (error) {
    console.error('Error fetching pending sellers:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pending sellers'
    });
  }
});

// Get verified sellers
router.get("/sellers/verified", async (req, res) => {
  try {
    const verifiedSellers = await Seller.find({ "identityVerification.status": "Verified" })
      .select('name storeName email gstn createdAt address identityVerification bankDetails profileImage')
      .sort({ updatedAt: -1 });

    res.json({
      success: true,
      sellers: verifiedSellers
    });
  } catch (error) {
    console.error('Error fetching verified sellers:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch verified sellers'
    });
  }
});

// Get seller statistics
router.get("/sellers/stats", async (req, res) => {
  try {
    const [total, pending, verified] = await Promise.all([
      Seller.countDocuments(),
      Seller.countDocuments({ "identityVerification.status": "Pending" }),
      Seller.countDocuments({ "identityVerification.status": "Verified" })
    ]);

    res.json({
      success: true,
      total,
      pending,
      verified
    });
  } catch (error) {
    console.error('Error fetching seller statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch seller statistics'
    });
  }
});

// Product verification route
// Product verification route
router.get("/product", async (req, res) => {
  try {
    res.render("manager/product/index.ejs", { 
      title: "Product Verification", 
      role: "manager"
    });
  } catch (error) {
    console.error('Error rendering product page:', error);
    res.status(500).render("manager/product/index.ejs", {
      title: "Product Verification",
      role: "manager",
     
    });
  }
});

// Add verify product route
router.post("/product/verify/:id",  async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    product.verified = true;
    await product.save();

    res.json({
      success: true,
      message: "Product verified successfully"
    });
  } catch (error) {
    console.error('Error verifying product:', error);
    res.status(500).json({
      success: false,
      message: "Failed to verify product"
    });
  }
});

// Add reject product route
router.post("/product/reject/:id",  async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    product.verified = false;
    await product.save();

    res.json({
      success: true,
      message: "Product rejected successfully"
    });
  } catch (error) {
    console.error('Error rejecting product:', error);
    res.status(500).json({
      success: false,
      message: "Failed to reject product"
    });
  }
});
// Get pending products
router.get("/products/pending", async (req, res) => {
  try {
    const pendingProducts = await Product.find({ verified: false })
      .populate('sellerId', 'name email storeName')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      products: pendingProducts
    });
  } catch (error) {
    console.error('Error fetching pending products:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pending products'
    });
  }
});

// Get verified products
router.get("/products/verified", async (req, res) => {
  try {
    const verifiedProducts = await Product.find({ verified: true })
      .populate('sellerId', 'name email storeName')
      .sort({ updatedAt: -1 });

    res.json({
      success: true,
      products: verifiedProducts
    });
  } catch (error) {
    console.error('Error fetching verified products:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch verified products'
    });
  }
});

// Get product statistics
router.get("/products/stats", async (req, res) => {
  try {
    const [total, pending, verified] = await Promise.all([
      Product.countDocuments(),
      Product.countDocuments({ verified: false }),
      Product.countDocuments({ verified: true })
    ]);

    res.json({
      success: true,
      total,
      pending,
      verified
    });
  } catch (error) {
    console.error('Error fetching product statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product statistics'
    });
  }
});
export default router;