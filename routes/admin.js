
// ...existing code...

// Render blogs list page in admin


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

// Helpers for React-compatible API responses and basic validation
import mongoose from "mongoose";
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);
const sendError = (res, status, message, error) =>
  res.status(status).json({ success: false, message, error: error?.message });

// React: no server-side rendering; provide API hints instead
router.get("/blog/create", (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Render blog creation UI on the client. Use POST /api/v1/admin/blog to create."
  });
});
router.get("/blogs/page", async (req, res) => {
  try {
    const blogs = await Blog.find({}).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, blogs });
  } catch (error) {
    return sendError(res, 500, "Failed to load blogs", error);
  }
});
// Create a new blog post with image upload
router.post("/blog", multerUpload.single("image"), async (req, res) => {
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
        return res.status(201).json({ success: true, message: "Blog created successfully", blog });
      });
      // Write the buffer to the stream
      result.end(req.file.buffer);
      return;
    } else {
      // No image uploaded
      const blog = new Blog({ title, content, author });
      await blog.save();
      return res.status(201).json({ success: true, message: "Blog created successfully", blog });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to create blog", error: error.message });
  }
});

// Fetch all blogs
router.get("/blogs", async (req, res) => {
  try {
    const blogs = await Blog.find({}).sort({ createdAt: -1 });
    res.json({ success: true, blogs });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch blogs", error: error.message });
  }
});

router.get("/login", (req, res) => {
  const { error } = req.query;
  return res.status(200).json({ success: true, error: error || null });
});

router.get("/secondHand", async (req, res) => {
  try {
    const products = await SellProduct.find().populate("user_id", "firstname");
    return res.status(200).json({ success: true, products });
  } catch (error) {
    return sendError(res, 500, "Failed to fetch second hand products", error);
  }
})

router.get("/dashboard", async (req, res) => {
  try {
    const users = await User.find({}).populate(["cart.productId", "products"]);
    const products = await Product.find({}).populate("sellerId");
    let totalCartAmount = 0;
    let customerOrders = 0;
    let sellerOrders = 0;
    let UserCount = 0;
    let CustomerCount = 0;

    users.forEach(user => {
      const isSeller = user.products && user.products.length > 0;
      if (!isSeller) {
        UserCount += 1;
        CustomerCount += 1;
        if (user.cart && Array.isArray(user.cart)) {
          user.cart.forEach(cartItem => {
            if (cartItem.productId) {
              totalCartAmount += cartItem.productId.price * cartItem.quantity;
            }
          });
          customerOrders += user.cart.length;
        }
      } else {
        sellerOrders += user.products.length;
      }
    });

    return res.status(200).json({
      success: true,
      metrics: {
        totalCartAmount,
        customerOrders,
        sellerOrders,
        UserCount,
        CustomerCount
      },
      users,
      products,
      registeredProducts: products
    });
  } catch (error) {
    console.error("Dashboard Error:", error);
    return sendError(res, 500, "Error loading dashboard", error);
  }
});
router.post("/dashboard", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }
    if (email !== "adminLogin@gmail.com" || password !== "swiftmart") {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }
    return res.status(200).json({ success: true, message: "Authenticated", redirect: "/api/v1/admin/dashboard" });
  } catch (error) {
    console.error(error);
    return sendError(res, 500, "Internal server error", error);
  }
});

router.get("/customers", async (req, res) => {
  try {
    const customers = await User.find({});
    return res.status(200).json({ success: true, customers });
  } catch (error) {
    return sendError(res, 500, "Failed to fetch customers", error);
  }
});

router.get("/api/customers", async (req, res) => {
  try {
    const customers = await User.find({});
    return res.json({
      success: true,
      customers
    });
  } catch (error) {
    return res.json({
      success: false,
      message: "Failed to fetch customers",
      error: error.message
    });
  }
});

router.get("/dashboard/sellproduct", async (req, res) => {
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

    return res.status(200).json({ success: true, products: dataWithUsernames });

  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});
router.post("/dashboard/sellproduct", async (req, res) =>{
  const {id , userStatus} = req.body || {};
  try {
    if (!id || !isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "Valid id is required" });
    }
    await SellProduct.findByIdAndUpdate(id, { userStatus });
    return res.status(200).json({ success: true, message: "User status updated" });
  } catch (err) {
    console.error(err);
    return sendError(res, 500, "Error updating user status", err);
  }
  
})
router.get("/customer/details", async (req, res) => {
  try {
    const customers = await User.find({});
    return res.json({
      customers
    })
  } catch (error) {
    return res.json({
      message: "Server error",
      success: false
    })
  }
})
router.get("/products", async (req, res) => {
  try {
    const products = await Product.find({}).populate("sellerId");
    return res.status(200).json({ success: true, products });
  } catch (error) {
    return sendError(res, 500, "Failed to fetch products", error);
  }
})

router.get("/vendors", async (req, res) => {
  try {
    const sellers = await Seller.find({});
    return res.status(200).json({ success: true, vendors: sellers });
  } catch (error) {
    return sendError(res, 500, "Failed to fetch vendors", error);
  }
});

router.delete("/product/:id", async (req, res) => {
  try {
    const id = req.params.id;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "Invalid product id" });
    }
    const product = await Product.findByIdAndDelete(id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    // Best-effort detach from seller's products if such relation exists
    await Seller.updateMany({}, { $pull: { products: id } });
    return res.status(200).json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    console.error("Delete product error:", error);
    return sendError(res, 500, "Server error", error);
  }
})

router.get("/api/products", async (req, res) => {
  try {
    const products = await Product.find({}).populate("sellerId");
    return res.json({
      success: true,
      products
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server Error",
      success: false
    });
  }
});

// Backward compatibility: keep old route pointing to same handler
router.get("/products/details", async (req, res) => {
  try {
    const products = await Product.find({}).populate("sellerId");
    return res.status(200).json({
      success: true,
      products
    });
  } catch (error) {
    return sendError(res, 500, "Server Error", error);
  }
});

router.delete("/customer/:id", async (req, res) => {
  try {
    const id = req.params.id;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "Invalid user id" });
    }
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        message: "No user with given id exists",
        success: false
      });
    }

    await user.deleteOne();
    return res.status(200).json({
      message: "User deleted successfully",
      success: true
    })
  } catch (error) {
    console.log(error);
    return sendError(res, 500, "Server error", error);
  }
});


router.get("/product/approve/:id", async (req, res) => {
  try {
    const id = req.params.id;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "Invalid product id" });
    }
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    product.verified = true;
    await product.save();
    return res.status(200).json({
      message: "Product approved successfully",
      success: true
    })
  } catch (error) {
    return sendError(res, 500, "Server Error", error);
  }
});

router.get("/product/disapprove/:id",async(req,res)=>{
  try {
    const id = req.params.id;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "Invalid product id" });
    }
    const product = await Product.findById(id);
    if(!product){
      return res.status(404).json({
        message:"No such product exists",
        success:false
      })
    }
    product.verified=false;
    await product.save();
    return res.status(200).json({
      message:"Product disapproved successfully",
      success:true
    })
  } catch (error) {
    return sendError(res, 500, "Server Error", error);
  }
})

router.get("/seller", async (req, res) => {
  try {
    const sellers = await Seller.find({});
    return res.status(200).json({ success: true, sellers });
  } catch (error) {
    return sendError(res, 500, "Failed to fetch sellers", error);
  }
});

router.get("/seller/approve/:id", async (req, res) => {
  try {
    const id = req.params.id;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "Invalid seller id" });
    }
    const seller = await Seller.findById(id);
    if (!seller) {
      return res.status(404).json({
        message: "No Such user exist",
        success: false
      })
    }
    seller.identityVerification.status = "Verified"
    await seller.save();
    return res.status(200).json({
      message: "Seller approved successfully",
      success: true
    })
  } catch (error) {
    return sendError(res, 500, "Server Error", error);
  }
})

router.get("/seller/details", async (req, res) => {
  try {
    const sellers = await Seller.find({});
    return res.status(200).json({
      sellers,
      success: true,
      message: "Seller retireved Successfully"
    })
  } catch (error) {
    return sendError(res, 500, "Server Error", error);
  }
});

router.get("/api/sellers", async (req, res) => {
  try {
    const sellers = await Seller.find({});
    res.json({
      success: true,
      sellers
    });
  } catch (error) {
    res.json({
      success: false,
      message: "Failed to fetch sellers",
      error: error.message
    });
  }
});

// Delete a seller by id (and optionally their products)
router.delete("/seller/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "Invalid seller id" });
    }
    const seller = await Seller.findById(id);
    if (!seller) {
      return res.status(404).json({ success: false, message: "Seller not found" });
    }

    // Optional: remove products belonging to this seller
    await Product.deleteMany({ sellerId: id });

    await seller.deleteOne();
    return res.status(200).json({ success: true, message: "Seller deleted successfully" });
  } catch (error) {
    console.error("Error deleting seller:", error);
    return res.status(500).json({ success: false, message: "Failed to delete seller" });
  }
});

router.get("/manager", async (req, res) => {
  try {
    const managers = await Manager.find().select("email createdAt");
    return res.status(200).json({ success: true, managers });
  } catch (error) {
    return sendError(res, 500, "Failed to fetch managers", error);
  }
});

router.post('/create/manager', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const existingManager = await Manager.findOne({ email });
    if (existingManager) {
      return res.status(409).json({ success: false, message: 'Manager with this email already exists.' });
    }

    const manager = new Manager({ email, password });
    await manager.save();
    return res.status(201).json({ success: true, message: 'Manager created successfully!' });
  } catch (error) {
    console.error('Create manager error:', error);
    return sendError(res, 500, 'Error creating manager', error);
  }
});

router.get("/order", async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate({ path: 'userId', select: 'firstname lastname email' })
      .populate({ path: 'products.productId', select: 'title image price' });
    return res.status(200).json({ success: true, orders });
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

    return res.json(userOrders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

// Replace the POST and GET routes to use the same handler
router.post("/orders", getOrdersGrouped);
router.get("/orders", getOrdersGrouped);

router.get("/orders/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    if (!isValidObjectId(userId)) {
      return res.status(400).json({ success: false, message: 'Invalid user id' });
    }
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

router.put('/orders/:orderId/status', async (req, res) => {
  try {
      const { orderId } = req.params;
      const { orderStatus } = req.body;
      if (!isValidObjectId(orderId)) {
        return res.status(400).json({ success: false, message: 'Invalid order id' });
      }

      // Validate order status
      const validStatuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Returned'];
      if (!validStatuses.includes(orderStatus)) {
          return res.status(400).json({
              success: false,
              message: 'Invalid order status'
          });
      }

      // Find and update the order
      const order = await Order.findById(orderId);
      
      if (!order) {
          return res.status(404).json({
              success: false,
              message: 'Order not found'
          });
      }

      // Update order status
      order.orderStatus = orderStatus;
      await order.save();

      // Send success response
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

// Route to fetch order user data by order ID
router.get('/orders/user/:orderId', async (req, res) => {
  try {
    const orderId = req.params.orderId;
    if (!isValidObjectId(orderId)) {
      return res.status(400).json({ success: false, message: 'Invalid order id' });
    }
    
    // Find the order and populate user and product details
    const order = await Order.findById(orderId)
      .populate('userId')
      .populate({
        path: 'products.productId',
        select: 'title price image'
      });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
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

    res.status(200).json({
      success: true,
      userId: userData._id,
      userData: {
        name: userData.name,
        email: userData.email,
        orders: userData.orders
      }
    });

  } catch (error) {
    console.error('Error fetching order user data:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Get all managers
router.get('/managers', async (req, res) => {
    try {
        const managers = await Manager.find().select('email createdAt');
        
        res.json({
            success: true,
            managers
        });
    } catch (error) {
        console.error('Error fetching managers:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch managers'
        });
    }
});

// Delete manager
router.delete('/managers/:id', async (req, res) => {
    try {
        const managerId = req.params.id;
        const manager = await Manager.findById(managerId);
        
        if (!manager) {
            return res.status(404).json({
                success: false,
                message: 'Manager not found'
            });
        }

        await manager.deleteOne();
        
        res.json({
            success: true,
            message: 'Manager deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting manager:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete manager'
        });
    }
});


router.get("/delivery", async (req, res) => {
  try {
    // Placeholder for React UI; implement delivery partner model when available
    return res.status(200).json({ success: true, message: 'Use client UI to manage deliveries.' });
  } catch (error) {
    console.error('Error loading delivery management:', error);
    return sendError(res, 500, 'Error loading delivery management', error);
  }
});


export default router