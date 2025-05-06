import express from "express";
import User from "../models/user.js";
import Product from "../models/product.js";
import Seller from "../models/seller.js";
import Manager from "../models/manager.js";
import Order from "../models/orders.js";
import SellProduct from "../models/SellProduct.js"
const router = express.Router();

router.get("/login", (req, res) => {
  return res.render('admin/login/index.ejs', { title: 'login', role: "admin" })
})

router.get("/secondHand", (req, res) => {
  return res.render("admin/secondhandProducts/index.ejs", { title: "secondHandProduct", role: "admin" });
})

router.get("/dashboard", async (req, res) => {

  try {
    const users = await User.find({}).populate(["cart.productId", "products"]);
    const products = await Product.find({}).populate("sellerId");
    let totalCartAmount = 0;
    let customerOrders = 0;
    let sellerOrders = 0;
    let UserCount = 0;
    let CustomerCount = 0; // Added CustomerCount variable

    users.forEach(user => {
      const isSeller = user.products && user.products.length > 0;
      
      if (!isSeller) {
        UserCount += 1;
        CustomerCount += 1; // Increment CustomerCount for non-sellers
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

    res.render("admin/dashboard/index.ejs", {
      title: "Admin Dashboard",
      role: "admin",
      totalCartAmount,
      customerOrders,
      sellerOrders,
      UserCount,
      CustomerCount, // Added CustomerCount to template data
      users,
      products,
      registeredProducts: products // Add this line to pass products as registeredProducts
    });
  } catch (error) {
    console.error("Dashboard Error:", error);
    res.status(500).render("error", {
      message: "Error loading dashboard",
      error: error
    });
  }
});
router.post("/dashboard", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (email !== "adminLogin@gmail.com" && password !== "swiftmart") {
      res.redirect("/api/v1/user/login");
    }
    res.redirect("/api/v1/admin/dashboard");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

router.get("/customers", async (req, res) => {
  const customers = await User.find({});
  console.log(customers);
  return res.render("admin/Customers/index.ejs", { title: "Customers", role: "admin", customers });
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

    res.render("admin/dashboard/sellproduct/dummyboard", { title: "Admin Product Dashboard",role: "admin" , products: dataWithUsernames });

  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});
router.post("/dashboard/sellproduct", async (req, res) =>{
  const {id , userStatus} = req.body;
  try {
    await SellProduct.findByIdAndUpdate(id, { userStatus });
    res.redirect("/api/v1/admin/dashboard/sellproduct");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error updating user status");
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
      sucess: false
    })
  }
})
router.get("/products", (req, res) => {
  return res.render("admin/Products/index.ejs", { title: "Products", role: "admin" });
})

router.get("/vendors", (req, res) => {
  res.render("User/Vendor/index.ejs", { title: 'Vendors', role: "admin" });
});

router.delete("/product/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const product = await Product.findByIdAndDelete(id, { new: true });
    await Seller.findOneAndUpdate({ _id: product._id }, { $pull: { id } })
    res.json({
      message: "Product deleted successfully",
      sucess: true
    })
  } catch (error) {
    res.json({
      message: "Server Error",
      success: false
    })
  }
})

router.get("/products/details", async (req, res) => {
  try {
    const products = await Product.find({}).populate("sellerId");
    console.log(products);
    return res.json({
      products
    })
  } catch (error) {
    res.json({
      message: "Sever Error",
      sucess: false
    })
  }
});

router.delete("/customer/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const user = await User.findById(id);
    if (!user) {
      return res.json({
        message: "No user with give id exists",
        sucess: false
      })
    }

    await user.deleteOne();
    return res.json({
      message: "User deleted sucessFully",
      sucess: true
    })
  } catch (error) {
    return res.json({
      message: "Server error",
      sucess: false
    })
  }
});


router.get("/product/approve/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const product = await Product.findById(id);
    if (!id) {
      res.json({
        message: "Error in approving",
        success: true
      })
    }
    product.verified = true;
    await product.save();
    res.json({
      message: "Product approved successfully",
      success: true
    })
  } catch (error) {
    res.json({
      message: "Server Error",
      sucess: false
    })
  }
});

router.get("/product/disapprove/:id",async(req,res)=>{
  try {
    const id = req.params.id;
    const product = await Product.findById(id);
    if(!product){
      return res.json({
        message:"No such Product exits",
        success:false
      })
    }
    product.verified=false;
    await product.save();
    return res.json({
      message:"Product disapproved successfully",
      success:true
    })
  } catch (error) {
    res.json({
      message:"Server Error",
      success:false
    })
  }
})

router.get("/seller", (req, res) => {
  res.render("admin/Sellers/index.ejs", { title: "Sellers", role: "admin" });
});

router.get("/seller/approve/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const seller = await Seller.findById(id);
    if (!seller) {
      return res.json({
        message: "No Such user exist",
        success: false
      })
    }
    seller.identityVerification.status = "Verified"
    await seller.save();
    res.json({
      message: "Seller approved successfully",
      success: true
    })
  } catch (error) {
    res.json({
      message: "Server Error",
      sucess: false
    })
  }
})

router.get("/seller/details", async (req, res) => {
  try {
    const sellers = await Seller.find({});
    res.json({
      sellers,
      success: true,
      message: "Seller retireved Successfully"
    })
  } catch (error) {
    res.json({
      message: "Server Error",
      success: false
    })
  }
});

router.get("/manager", (req, res) => {
  return res.render("admin/manager/index.ejs", { title: "Manager", role: "admin" });
});

router.post('/create/manager', async (req, res) => {
    const { email, password } = req.body;
    console.log(email,password)

    try {
        // Check if manager already exists
        const existingManager = await Manager.findOne({ email });
        if (existingManager) {
            return res.status(400).json({ message: 'Manager with this email already exists.' });
        }

        // Create new manager
        const manager = new Manager({ email, password });
        await manager.save();

        res.status(201).json({ message: 'Manager created successfully!' });
    } catch (error) {
        res.status(500).json({ message: 'Error creating manager', error });
    }
});

router.get("/order", (req, res) => {
  return res.render("admin/Orders/index.ejs", { title: "Orders", role: "admin" });
});

router.post("/orders", async (req, res) => {
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
  
    console.log(userOrders)
    res.json(userOrders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get("/orders", async (req, res) => {
  try {
    const users = await User.find({})
      .populate({
        path: 'orders',
        populate: {
          path: 'products.productId',
          model: 'Product'
        }
      });

    const ordersData = users.reduce((acc, user) => {
      if (user.orders && user.orders.length > 0) {
        acc[user._id] = {
          _id: user._id,
          name: `${user.firstname} ${user.lastname}`,
          email: user.email,
          orders: user.orders
        };
      }
      return acc;
    }, {});

    res.json({
      success: true,
      orders: ordersData
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching orders'
    });
  }
});

router.get("/orders/:userId", async (req, res) => {
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

router.put('/orders/:orderId/status', async (req, res) => {
  try {
      const { orderId } = req.params;
      const { orderStatus } = req.body;

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

    res.json({
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




// Update order status
router.put('/orders/:orderId/status', async (req, res) => {
    try {
        const { orderId } = req.params;
        const { orderStatus } = req.body;

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
    // // Get pending orders (orders without delivery partner assigned)
    // const orders = await Order.find({ deliveryPartner: null })
    //   .populate('userId', 'firstname lastname email')
    //   .populate('address');

    // // Get all delivery partners
    // const deliveryPartners = await DeliveryPartner.find({ isAvailable: true });

    // // Get orders assigned today
    // const today = new Date();
    // today.setHours(0, 0, 0, 0);
    // const assignedToday = await Order.countDocuments({
    //   deliveryPartner: { $ne: null },
    //   updatedAt: { $gte: today }
    // });

    return res.render("admin/Delivery/index.ejs", {
      title: "Delivery Management",
      role: "admin",
      // pendingOrders: orders.length,
      // availablePartners: deliveryPartners.length,
      // assignedToday,
      // orders: orders.map(order => ({
      //   _id: order._id,
      //   customer: {
      //     name: `${order.userId.firstname} ${order.userId.lastname}`,
      //     email: order.userId.email
      //   },
      //   address: order.address
      // })),
      // deliveryPartners: deliveryPartners.map(partner => ({
      //   _id: partner._id,
      //   name: partner.name
      // }))
    });
  } catch (error) {
    console.error('Error loading delivery management page:', error);
    return res.status(500).render('error', {
      message: 'Error loading delivery management page',
      error: error
    });
  }
});


export default router