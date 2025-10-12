import express from 'express';
import {
    accountRenderController,
    accountShowRenderController,
    addressRenderController,
    addToCartController,
    blogController,
    blogRenderController,
    cartRenderController,
    deleteFromCartController,
    loginController,
    loginPageRenderController,
    logoutController,
    removeFromCartController,
    renderCartController,
    shopController,
    signupController,
    signupPageRenderController,
    vendorsController
} from '../controller/user.js';
import User from '../models/user.js';
import isAuthenticated from '../middleware/isAuthenticated.js';
import {
    title
} from 'process';
import Product from '../models/product.js';
import Review from '../models/Reviews.js';
import SellProduct from '../models/SellProduct.js';

import Order from "../models/orders.js";
import UserHistory from "../models/userHistory.js";
import path from 'path';
const router = express.Router();

// Inject chatbot widget into all user-rendered HTML pages
const CHATBOT_SNIPPET = '<script src="https://nordan-backend-production.up.railway.app/public/widget.js" defer nordankey="LBK1C5VHQ1ztE"></script>';
router.use((req, res, next) => {
  const originalRender = res.render.bind(res);

  res.render = (view, options, callback) => {
    if (typeof options === 'function') {
      callback = options;
      options = {};
    }
    const wrap = (err, html) => {
      if (err) {
        return callback ? callback(err) : res.status(500).send('Template render error');
      }
      if (typeof html === 'string') {
        html = /<\/body>/i.test(html)
          ? html.replace(/<\/body>/i, `${CHATBOT_SNIPPET}\n</body>`)
          : `${html}\n${CHATBOT_SNIPPET}`;
      }
      return callback ? callback(null, html) : res.send(html);
    };
    return originalRender(view, options || {}, wrap);
  };

  next();
});

// New route to get products as JSON
router.get("/products", isAuthenticated, async (req, res) => {
    try {
        const products = await Product.find({}).limit(8); 
        res.json(products);
    } catch (error) {
        res.status(500).json({
            message: "Error fetching products."
        });
    }
});


router.get("/login", loginPageRenderController)
router.post("/login", loginController)
router.get("/signup", signupPageRenderController)
router.post("/signup", signupController);

router.get("/logout", logoutController);
router.get("/account", isAuthenticated, accountShowRenderController);
router.get("/account/update", isAuthenticated, accountRenderController);
router.post("/account/update", isAuthenticated, async (req, res) => {
    const {
        firstname,
        lastname,
        email
    } = req.body;

    try {
        if (!email || !firstname || !lastname) {
            return res.redirect("/api/v1/user/account");
        }
        await User.findByIdAndUpdate(req.userId, {
            firstname,
            lastname,
            email
        })
        res.redirect("/api/v1/user/account");
        return;
    } catch (error) {
        return res.redirect("/api/v1/user/account");
    }
});
router.get("/sell", isAuthenticated, async (req, res) => {
    res.render("User/sell/index.ejs", {
        title: "Sell Product",
        role: "user"
    });

});
router.get("/store", (req, res) => {
    return res.render("User/store/index.ejs", {
        title: "Store",
        role: "user"
    });
});


// IMPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPP
//  NEW ROUTE to get the current user's details as JSON
router.get("/account/details", isAuthenticated, async (req, res) => {
  try {
    // Find the user by the ID from the token and select only the necessary fields
    const user = await User.findById(req.userId).select('firstname lastname email');
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.json({ success: true, user });
  } catch (error) {
    console.error("Error fetching user details:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

router.get("/account/address/details", isAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('Address');
    if (!user || !user.Address) {
      // If no address is set, return a default or empty structure
      return res.json({ 
        success: true, 
        address: { plotno: '', street: '', city: '', state: '', pincode: '', phone: '' } 
      });
    }
    res.json({ success: true, address: user.Address });
  } catch (error) {
    console.error("Error fetching user address:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

router.get("/account/address", isAuthenticated, addressRenderController);
router.get("/account/update/address", isAuthenticated, async (req, res) => {
    const user = await User.findById(req.userId);
    console.log(user);
    res.render("User/accountAddress/edit.ejs", {
        title: 'Update Account Address',
        role: "user",
        user
    });
})
router.post("/account/update/address", isAuthenticated, async (req, res) => {

    try {

        const {
            plotno,
            street,
            city,
            state,
            pincode,
            phone
        } = req.body;
        if (!plotno || !street || !city || !state || !pincode || !phone) {
            return res.status(400).json({
                messag: "Enter all fields",
                success: false
            })
        }
        const user = await User.findById(req.userId);
        if (plotno) user.Address.plotno = plotno;
        if (street) user.Address.street = street;
        if (city) user.Address.city = city;
        if (state) user.Address.state = state;
        if (pincode) user.Address.pincode = pincode;
        if (phone) user.Address.phone = phone;
        await user.save();
        res.status(200).json({
            message: "Address updated sucessfully",
            success: true
        })
    } catch (error) {
        res.status(500).json({
            message: "Something went Wrong",
            success: false
        })
    }
})
router.get("/blog/:id", isAuthenticated, blogController);
router.get("/shop", isAuthenticated, shopController);
router.get("/vendors", isAuthenticated, vendorsController)
router.get('/blog', isAuthenticated, blogRenderController);
router.get('/contact', isAuthenticated, (req, res) => res.render('User/contact/index.ejs', {
    title: 'Contact Page',
    role: "user"
}));
router.get("/cart", cartRenderController)
router.post("/cart", isAuthenticated, renderCartController)
router.post("/cart/add/:id", isAuthenticated, addToCartController)
router.post("/cart/remove/:id", isAuthenticated, removeFromCartController)
router.delete("/cart/remove/:id", isAuthenticated, deleteFromCartController);


//  NEW ROUTE to provide checkout data as JSON
router.get("/checkout-details", isAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.userId).populate("cart.productId");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    let total = 0;
    user.cart?.forEach((e) => {
      total += Math.round(e?.productId?.price) * e.quantity;
    });

    const result = await SellProduct.aggregate([
      { $match: { user_id: req.userId } },
      { $group: { _id: '$user_id', totalEstimatedValue: { $sum: '$estimated_value' } } }
    ]);
  
    const extra = result.length > 0 ? result[0].totalEstimatedValue : 0;

    res.json({
      success: true,
      user: {
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        Address: user.Address,
        cart: user.cart
      },
      total,
      extra
    });

  } catch (error) {
    console.error("Checkout details error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});


router.get("/checkout", isAuthenticated, async (req, res) => {
  // This route now just renders the page shell.
  // The data will be fetched by the client-side script.
  res.render("User/payment/index.ejs", { title: "Checkout Page", role: "user" });
});


router.post("/payment", isAuthenticated, async (req, res) => {
    try {
        const {
            paymentMethod,
            address
        } = req.body;
        const {
            userId
        } = req;
        console.log(address);
        if (!address ||
            !address.plotno ||
            !address.street ||
            !address.city ||
            !address.state ||
            !address.pincode
        ) {
            return res.status(400).json({
                error: "Shipping address is incomplete"
            });
        }

        const user = await User.findById(userId).populate("cart.productId");
        if (!user) return res.status(404).json({
            error: "User not found"
        });
        if (user.cart.length === 0) return res.status(400).json({
            error: "Cart is empty"
        });

        const products = user.cart.map((item) => ({
            productId: item.productId._id,
            quantity: item.quantity,
            price: item.productId.price,
        }));

        const result = await SellProduct.aggregate([{
            $match: {
                user_id: req.userId
            }
        }, {
            $group: {
                _id: '$user_id',
                totalEstimatedValue: {
                    $sum: '$estimated_value'
                }
            }
        }]);

        const extra = result[0].totalEstimatedValue || 0;

        let totalAmount = products.reduce(
            (acc, item) => acc + item.price * item.quantity,
            0
        );
        totalAmount -= extra;

        const newOrder = new Order({
            userId: user._id,
            products,
            totalAmount,
            paymentStatus: "Pending",
            paymentMethod,
            shippingAddress: {
                fullname: `${user.firstname} ${user.lastname}`,
                plotno: address.plotno,
                street: address.street,
                city: address.city,
                state: address.state,
                pincode: address.pincode,
                phone: address.phone,
            },
        });

        await newOrder.save();

        let userHistory = await UserHistory.findOne({
            userId: user._id
        });
        if (!userHistory) {
            userHistory = new UserHistory({
                userId: user._id,
                orders: [],
            });
        }

        userHistory.orders.push({
            orderId: newOrder._id,
            products,
            totalAmount,
            status: "Pending",
        });

        await userHistory.save();

        user.cart = [];
        await user.save();
        console.log("como")
        res.status(200).json({
            message: "Payment processed and order placed successfully"
        });
    } catch (err) {
        console.error("Payment error:", err);
        res.status(500).json({
            error: "Something went wrong"
        });
    }
});



//  NEW ROUTE for fetching donated products data
router.get("/donated-products", isAuthenticated, async (req, res) => {
  try {
    const userId = req.userId;
    const products = await SellProduct.find({ user_id: userId });
    const user = await User.findById(userId).select("firstname");

    const dataWithImages = products.map(item => ({
      username: user.firstname,
      items: item.items,
      fabric: item.fabric,
      size: item.size,
      gender: item.gender,
      readableUsage: item.usageDuration > 1 ? '> 1 year' : 'Less than 6 months',
      imageSrc: item.image?.data
        ? `data:${item.image.contentType};base64,${item.image.data.toString('base64')}`
        : null,
      clothesDate: item.clothesDate,
      timeSlot: item.timeSlot,
      userStatus: item.userStatus,
      estimated_value: item.estimated_value
    }));

    res.json({ success: true, products: dataWithImages, username: user.firstname });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});


router.get("/dashboard/sellproduct", isAuthenticated, async (req, res) => {
  // This route no longer needs to fetch data. It just renders the shell.
  // The username can also be passed if needed, or fetched client-side.
  const user = await User.findById(req.userId).select("firstname");
  res.render("User/dashboard/sellproduct/dummyboard.ejs", { title: "sellproduct", role: "user", username: user.firstname });
});



// NEW ROUTE to serve order history data as JSON
router.get("/order-history", isAuthenticated, async (req, res) => {
  try {
    const userId = req.userId;
    const orderHistory = await UserHistory.findOne({ userId })
      .populate({
        path: "orders.products.productId",
        model: "Product",
        select: "title description price category image" // Select fields you need
      });

    if (!orderHistory) {
      return res.json({ success: true, orders: [] }); // Send empty array if no history
    }

    res.json({ success: true, orders: orderHistory.orders });
  } catch (error) {
    console.error("Error fetching order history:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});


router.get("/dashboard", isAuthenticated, async (req, res) => {
  try {
    // This route now only needs to fetch the user's name for the welcome message.
    // The detailed order data will be fetched by the client-side script.
    const user = await User.findById(req.userId).select("firstname");
    if (!user) {
      return res.status(404).send("User not found");
    }
    res.render("User/dashboard/index.ejs", {
      title: "Dashboard",
      role: "user",
      username: user.firstname // Pass only the username
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    res.status(500).send("Error loading dashboard");
  }
});


router.post("/review/create/:id", isAuthenticated, async (req, res) => {
    try {
        const id = req.params.id;

        const {
            description,
            rating
        } = req.body;

        if (!description || !id || !rating) {
            return res.json({
                message: "Please Enter all fields",
                success: false
            })
        }

        const review = await Review.create({
            user: req.userId,
            product: id,
            rating: Number(rating),
            description
        });

        await Promise.all([
            review.save(),
            User.findByIdAndUpdate(req.userId, {
                $push: {
                    reviews: review._id
                }
            }),
            Product.findByIdAndUpdate(id, {
                $push: {
                    reviews: review._id
                }
            })
        ]);
        res.json({
            message: "Review Created Sucessfully",
            success: true
        })
    } catch (error) {
        res.json({
            message: "Server Error",
            success: false
        })
    }
})
router.get('/', isAuthenticated, (req, res) => {
    res.render('User/homepage/index.ejs', {
        title: 'Home',
        role: 'user'
    });
});


const combinationPoints = {
    // 6 months (age = "6")
    "CottonS6": 200,
    "CottonM6": 250,
    "CottonL6": 300,
    "SilkS6": 300,
    "SilkM6": 350,
    "SilkL6": 400,
    "LinenS6": 220,
    "LinenM6": 270,
    "LinenL6": 320,
    "LeatherS6": 450,
    "LeatherM6": 550,
    "LeatherL6": 600,
    "CashmereS6": 400,
    "CashmereM6": 450,
    "CashmereL6": 500,
    "SyntheticS6": 120,
    "SyntheticM6": 150,
    "SyntheticL6": 180,
    "WoolS6": 250,
    "WoolM6": 320,
    "WoolL6": 370,
    "DenimS6": 270,
    "DenimM6": 320,
    "DenimL6": 400,
    "PolyesterS6": 100,
    "PolyesterM6": 120,
    "PolyesterL6": 150,
    // More than 1 year (age = "1")
    "CottonS1": 140,
    "CottonM1": 180,
    "CottonL1": 220,
    "SilkS1": 220,
    "SilkM1": 260,
    "SilkL1": 300,
    "LinenS1": 160,
    "LinenM1": 200,
    "LinenL1": 240,
    "LeatherS1": 300,
    "LeatherM1": 350,
    "LeatherL1": 400,
    "CashmereS1": 260,
    "CashmereM1": 320,
    "CashmereL1": 350,
    "SyntheticS1": 70,
    "SyntheticM1": 90,
    "SyntheticL1": 110,
    "WoolS1": 180,
    "WoolM1": 220,
    "WoolL1": 260,
    "DenimS1": 160,
    "DenimM1": 200,
    "DenimL1": 240,
    "PolyesterS1": 60,
    "PolyesterM1": 80,
    "PolyesterL1": 100,
};

import multer from 'multer';
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024
    } // 5MB limit
});

// POST /sell route
router.post('/sell', isAuthenticated, upload.single('photos'), async (req, res) => {
    try {
        // Validate file presence
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Photo is required.'
            });
        }
        console.log(req.userId);

        // Build combination_id (fabric + size + age)
        const combination_id = req.body.fabric + req.body.size + req.body.age;

        // Lookup estimated value
        const estimated_value = combinationPoints[combination_id];

        if (estimated_value === undefined) {
            return res.status(400).json({
                success: false,
                message: `Invalid combination: ${combination_id}. Please check your input.`
            });
        }
        // Create new SellProduct document
        const newProduct = new SellProduct({
            user_id: req.userId,
            items: req.body.items,
            fabric: req.body.fabric,
            size: req.body.size,
            gender: req.body.gender,
            usageDuration: req.body.age,
            image: {
                data: req.file.buffer,
                contentType: req.file.mimetype,
            },
            description: req.body.description,
            clothesDate: req.body.clothesDate,
            timeSlot: req.body.timeSlot,

            combination_id: combination_id,
            estimated_value: estimated_value
        });

        await newProduct.save().catch(err => {
            console.error("Mongoose validation error:", err);
            throw err;
        });

        // res.render("User/sell/index.ejs", { title: "Sell Product", role: "user" });
        res.redirect('sell');

    } catch (error) {
        console.error('Error submitting product:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
});

//  route for filtered products
router.get("/products/filter", isAuthenticated, async (req, res) => {
    try {
        const {
            category,
            material,
            gender,
            size,
            minPrice,
            maxPrice
        } = req.query;

        // Build filter object
        const filter = {};

        if (category) {
            filter.category = category;
        }

        if (material) {
            filter.fabric = material;
        }

        if (gender) {
            filter.gender = gender;
        }

        if (size) {
            filter.size = size;
        }

        // Add price range filter if provided
        if (minPrice || maxPrice) {
            filter.price = {};
            if (minPrice) filter.price.$gte = Number(minPrice);
            if (maxPrice) filter.price.$lte = Number(maxPrice);
        }

        // Find products with applied filters
        const filteredProducts = await Product.find(filter);

        // Return filtered products as JSON
        res.status(200).json({
            success: true,
            products: filteredProducts
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error filtering products",
            error: error.message
        });
    }
});

export default router;