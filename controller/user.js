import jwt from 'jsonwebtoken';
import Stripe from "stripe";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import User from '../models/user.js';
import Product from '../models/product.js';
import bcrypt from 'bcryptjs';
import blogPosts from "../data/blogId.json" with {type: "json"}
import { assignUserToManager } from '../utils/managerAssignment.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "..", "..", ".env") });
const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;
const HomePageController = async (req, res) => {
  try {
    const productsRaw = await Product.find({ verified: true });
    // Apply 10% markup
    const products = productsRaw.map(p => {
      const pObj = p.toObject();
      pObj.price = Math.ceil(pObj.price * 1.1);
      return pObj;
    });
    res.render('User/homepage/index.ejs', { title: 'HomePage', products, role: "user" });

  } catch (error) {
    console.log(error);
  }
}

const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;

    const wantsJson =
      req.xhr ||
      req.is('application/json') ||
      (req.headers.accept && req.headers.accept.includes('application/json'));
    const prefersHtml = !wantsJson;
    const redirectWithError = (message) =>
      res.redirect(`/api/v1/user/login?error=${encodeURIComponent(message)}`);

    // Always clear any existing auth cookie before processing login
    res.clearCookie("token");

    if (!email || !password) {
      res.clearCookie("token");
      return prefersHtml
        ? redirectWithError("Email and password are required")
        : res.status(400).json({ success: false, message: "Email and password are required" });
    }

    const userCheck = await User.findOne({ email });
    if (!userCheck) {
      return prefersHtml
        ? redirectWithError("Invalid email or password")
        : res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    const isMatch = userCheck.password
      ? await bcrypt.compare(password, userCheck.password)
      : false;
    if (!isMatch) {
      return prefersHtml
        ? redirectWithError("Invalid email or password")
        : res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { userId: userCheck._id, role: "user" },
      "JWT_SECRET",
      { expiresIn: "5h" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 3600000,
    });

    if (prefersHtml) {
      return res.redirect("/api/v1/user/");
    }

    return res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: userCheck._id,
        firstname: userCheck.firstname,
        lastname: userCheck.lastname,
        email: userCheck.email,
      },
    });
  } catch (error) {
    console.log(error);
    res.clearCookie("token");
    const wantsJson =
      req.xhr ||
      req.is('application/json') ||
      (req.headers.accept && req.headers.accept.includes('application/json'));
    const prefersHtml = !wantsJson;
    if (prefersHtml) {
      return res.redirect("/api/v1/user/login?error=Something went wrong");
    }
    return res.status(500).json({ success: false, message: "Something went wrong" });
  }
};



const loginPageRenderController = (req, res) => {
  const error = req.query.error || "";
  res.render("User/auth/login", { title: 'login', error, role: "" });
}


const signupPageRenderController = (req, res) => {


  res.render('User/auth/signup.ejs', { title: 'signup', role: "user" })

}
const signupController = async (req, res) => {
  try {
    const { firstname, lastname, password, email } = req.body;
    const prefersHtml = req.accepts(['html', 'json']) === 'html';
    const redirectWithError = (message) =>
      res.redirect(`/api/v1/user/signup?error=${encodeURIComponent(message)}`);

    if (!firstname || !lastname || !email || !password) {
      return prefersHtml
        ? redirectWithError("All fields are required")
        : res.status(400).json({ success: false, message: "All fields are required" });
    }

    const userCheck = await User.findOne({ email });
    if (userCheck) {
      return prefersHtml
        ? redirectWithError("Email already in use")
        : res.status(409).json({ success: false, message: "Email already in use" });
    }

    const hashPassword = await bcrypt.hash(password, 10);
    const user = User.create({
      firstname, lastname, password: hashPassword, email
    });
    const savedUser = await (await user).save();

    await assignUserToManager(savedUser._id);

    if (prefersHtml) {
      return res.redirect("/api/v1/user/login");
    }
    return res.status(201).json({ success: true, message: "Signup successful" });
  } catch (error) {
    console.log(error);
    const prefersHtml = req.accepts(['html', 'json']) === 'html';
    if (prefersHtml) {
      return res.redirect("/api/v1/user/signup?error=Something went wrong");
    }
    return res.status(500).json({ success: false, message: "Something went wrong" });
  }
}



const logoutController = (req, res) => {
  // Clear the token cookie with all options to ensure removal
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : 'lax',
    path: '/'
  });

  // Also overwrite the cookie immediately to force removal in strict browsers
  res.cookie("token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : 'lax',
    path: '/',
    maxAge: 0
  });

  // Destroy session if it exists
  if (req.session) {
    req.session.destroy((err) => {
      if (err) {
        console.error("Session destruction error:", err);
      }
    });
  }

  const wantsJson =
    req.xhr ||
    req.is('application/json') ||
    (req.headers.accept && req.headers.accept.includes('application/json'));

  if (wantsJson) {
    return res.status(200).json({ success: true, message: "Logged out successfully" });
  }

  return res.redirect("/");
}

const renderCartController = async (req, res) => {
  try {
    const userId = req.userId;

    const user = await User.findById(userId).populate("cart.productId");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const cartObj = user.cart.map(item => {
      const itemObj = item.toObject ? item.toObject() : item;
      if (itemObj.productId && itemObj.productId.price) {
        itemObj.productId.price = Math.ceil(itemObj.productId.price * 1.1);
      }
      return itemObj;
    });
    res.json({ cart: cartObj });
  } catch (error) {

  }
}

// const cartRenderController =  (req, res) => {

//   res.render("User/cart/index.ejs", { title: "Cart", role: "user" });
// }
const addToCartController = async (req, res) => {
  try {
    const id = req.params.id;
    console.log(id);
    const userId = req.userId;
    const { size } = req.body;
    if (!id) {
      return res.json({
        message: "No product id provided",
        success: false
      })
    }
    const product = await Product.findOne({ _id: id });
    if (!product) {
      return res.json({
        message: "No such product",
        success: false
      })
    }

    const user = await User.findById(userId);
    const productCartCheck = user.cart.find(item =>
      item.productId.equals(product._id) && item.size === size
    );

    if (!productCartCheck) {
      user.cart.push({
        productId: product._id,
        quantity: 1,
        size: size
      });
    } else {
      productCartCheck.quantity += 1;
    }
    await user.save();
    res.json({
      message: "Product added",
      success: true
    })

  } catch (error) {
    console.log(error)
    return res.json({
      messag: "Server error",
      success: false
    })
  }
}

const removeFromCartController = async (req, res) => {
  try {
    const id = req.params.id;
    const userId = req.userId
    if (!id) {
      return res.json({
        message: "No product id provided",
        success: false
      })
    }
    const product = await Product.findOne({ _id: id });
    if (!product) {
      return res.json({
        message: "No such product",
        success: false
      })
    }

    const user = await User.findById(userId);
    const productCartCheck = user.cart.find(item => item.productId.equals(product._id));

    if (productCartCheck.quantity === 0) {
      user.cart.remove(productCartCheck);
    } else {
      productCartCheck.quantity -= 1;
    }
    (await user).save();
    res.json({
      message: "Product removed from cart",
      success: true
    })

  } catch (error) {
    console.log(error)
    return res.json({
      messag: "Server error",
      success: false
    })
  }
}


const deleteFromCartController = async (req, res) => {
  try {
    const id = req.params.id;
    const userId = req.userId
    if (!id) {
      return res.json({
        message: "No product id provided",
        success: false
      })
    }
    const product = await Product.findOne({ _id: id });
    if (!product) {
      return res.json({
        message: "No such product",
        success: false
      })
    }

    const user = await User.findById(userId);
    const productCartCheck = user.cart.find(item => item.productId.equals(product._id));

    if (productCartCheck) {
      user.cart.remove(productCartCheck);
    }
    (await user).save();
    res.json({
      message: "Product reomved from cart",
      success: true
    })
  } catch (error) {
    return res.json({
      messag: "Server error",
      success: false
    })
  }
}


const accountShowRenderController = async (req, res) => {
  const user = await User.findById(req.userId);
  res.render("User/account/show.ejs", { title: 'Account', role: req.role, user });
}
const accountRenderController = async (req, res) => {
  const user = await User.findById(req.userId);
  res.render("User/account/index.ejs", { title: 'Account', role: req.role, user });
}


const addressRenderController = async (req, res) => {
  const user = await User.findById(req.userId);
  res.render("User/accountAddress/index.ejs", { title: 'Account Address', role: req.role, user });
}

const blogController = (req, res) => {
  const id = parseInt(req.params.id);
  const blog = blogPosts.find(post => post.id === id);

  if (!blog) {
    return res.status(404).send("Blog post not found");
  }

  res.render("User/blog_post/article.ejs", { title: "Blog Article", blog, role: req.role });
}

const shopController = (req, res) => {
  res.render("User/Shop/index.ejs", { title: 'Shop', role: req.role });
}


const vendorsController = (req, res) => {
  res.render("User/Vendor/index.ejs", { title: 'Vendors', role: req.role });
}

const blogRenderController = (req, res) => res.render('User/blog/index.ejs', { title: 'Blog Page', role: req.role })

// --- ACCOUNT DETAILS CONTROLLER ---
const getAccountDetailsController = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('firstname lastname email coins');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }
    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error("Error fetching user details:", error);
    res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
};

// --- UPDATE ACCOUNT CONTROLLER ---
const updateAccountController = async (req, res) => {
  const {
    firstname,
    lastname,
    email
  } = req.body;

  try {
    if (!email || !firstname || !lastname) {
      return res.status(400).json({
        success: false,
        message: "All fields are required."
      });
    }
    const updatedUser = await User.findByIdAndUpdate(req.userId, {
      firstname,
      lastname,
      email
    }, {
      new: true
    }).select('firstname lastname email');

    res.json({
      success: true,
      user: updatedUser
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error updating account."
    });
  }
};

// --- GET ADDRESS CONTROLLER ---
const getAddressDetailsController = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('Address');
    if (!user || !user.Address) {
      return res.json({
        success: true,
        address: {
          plotno: '',
          street: '',
          city: '',
          state: '',
          pincode: '',
          phone: ''
        }
      });
    }
    res.json({
      success: true,
      address: user.Address
    });
  } catch (error) {
    console.error("Error fetching user address:", error);
    res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
};

// --- UPDATE ADDRESS CONTROLLER ---
const updateAddressController = async (req, res) => {
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
        message: "Enter all fields",
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
      success: true,
      address: user.Address
    })
  } catch (error) {
    res.status(500).json({
      message: "Something went Wrong",
      success: false
    })
  }
};

// --- GET ALL PRODUCTS CONTROLLER ---
const getAllProductsController = async (req, res) => {
  try {
    const products = await Product.find({}).limit(8).populate('reviews');
    const markedUpProducts = products.map(p => {
      const pObj = p.toObject();
      pObj.price = Math.ceil(pObj.price * 1.1);
      return pObj;
    });
    res.json(markedUpProducts);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching products."
    });
  }
};

// --- GET BLOG BY ID CONTROLLER ---
import Blog from '../models/blog.js';
const getBlogByIdController = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }
    res.json({
      success: true,
      blog
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// --- GET ALL BLOGS CONTROLLER ---
const getAllBlogsController = async (req, res) => {
  try {
    const blogs = await Blog.find({}).sort({ createdAt: -1 });
    res.json({
      success: true,
      blogs
    });
  } catch (error) {
    console.error("Error fetching blogs:", error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// --- CART OPERATIONS CONTROLLERS ---

// Add item to cart (with size handling)
const addItemToCartController = async (req, res) => {
  try {
    const id = req.params.id;
    const userId = req.userId;
    const { size } = req.body;

    if (!id) {
      return res.json({
        message: "No product id provided",
        success: false
      });
    }

    const product = await Product.findOne({ _id: id });
    if (!product) {
      return res.json({
        message: "No such product",
        success: false
      });
    }

    const user = await User.findById(userId);

    const productCartCheck = user.cart.find(item =>
      item.productId.equals(product._id) && item.size === size
    );

    if (!productCartCheck) {
      user.cart.push({
        productId: product._id,
        quantity: 1,
        size: size
      });
    } else {
      productCartCheck.quantity += 1;
    }
    await user.save();

    res.json({
      message: "Product added",
      success: true
    });

  } catch (error) {
    console.log(error);
    return res.json({
      message: "Server error",
      success: false
    });
  }
};

// Decrease item quantity from cart
const decreaseCartQuantityController = async (req, res) => {
  try {
    const id = req.params.id;
    const userId = req.userId;
    const { size } = req.body;

    if (!id) {
      return res.json({
        message: "No product id provided",
        success: false
      });
    }

    const user = await User.findById(userId);

    const productCartCheck = user.cart.find(item =>
      item.productId.toString() === id && item.size === size
    );

    if (productCartCheck) {
      if (productCartCheck.quantity <= 1) {
        user.cart = user.cart.filter(item =>
          !(item.productId.toString() === id && item.size === size)
        );
      } else {
        productCartCheck.quantity -= 1;
      }
      await user.save();
      res.json({
        message: "Product quantity updated",
        success: true
      });
    } else {
      res.json({
        message: "Item not found in cart",
        success: false
      });
    }

  } catch (error) {
    console.log(error);
    return res.json({
      message: "Server error",
      success: false
    });
  }
};

// Delete item completely from cart
const deleteItemFromCartController = async (req, res) => {
  try {
    const id = req.params.id;
    const userId = req.userId;
    const { size } = req.body;

    if (!id) {
      return res.json({
        message: "No product id provided",
        success: false
      });
    }

    const user = await User.findById(userId);

    const initialLength = user.cart.length;
    user.cart = user.cart.filter(item =>
      !(item.productId.toString() === id && item.size === size)
    );

    if (user.cart.length < initialLength) {
      await user.save();
      res.json({
        message: "Product removed from cart",
        success: true
      });
    } else {
      res.json({
        message: "Product not found in cart",
        success: false
      });
    }

  } catch (error) {
    console.log(error);
    return res.json({
      message: "Server error",
      success: false
    });
  }
};

// --- CHECKOUT & PAYMENT CONTROLLERS ---
import SellProduct from '../models/SellProduct.js';
import Order from '../models/orders.js';
import UserHistory from '../models/userHistory.js';

const getCheckoutDetailsController = async (req, res) => {
  try {
    const user = await User.findById(req.userId).populate("cart.productId");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    let total = 0;
    const cartObj = user.cart.map(item => {
      const itemObj = item.toObject ? item.toObject() : item;
      if (itemObj.productId && itemObj.productId.price) {
        itemObj.productId.price = Math.ceil(itemObj.productId.price * 1.1);
      }
      return itemObj;
    });

    cartObj.forEach((e) => {
      total += Math.round(e?.productId?.price || 0) * e.quantity;
    });

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

    const extra = result.length > 0 ? result[0].totalEstimatedValue : 0;

    res.json({
      success: true,
      user: {
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        Address: user.Address,
        cart: cartObj,
        coins: user.coins || 0
      },
      total,
      extra
    });

  } catch (error) {
    console.error("Checkout details error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
};

const processPaymentController = async (req, res) => {
  try {
    const {
      paymentMethod,
      address,
      useCoins
    } = req.body;
    const {
      userId
    } = req;

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

    const products = user.cart.map((item) => {
      const markedUpPrice = Math.ceil(item.productId.price * 1.1);
      return {
        productId: item.productId._id,
        quantity: item.quantity,
        price: markedUpPrice,
        sellerPrice: item.productId.price,
        size: item.size
      };
    });

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

    let totalAmount = products.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );

    let coinsUsed = 0;
    if (useCoins && user.coins > 0) {
      if (user.coins >= totalAmount) {
        coinsUsed = totalAmount;
        totalAmount = 0;
      } else {
        coinsUsed = user.coins;
        totalAmount -= user.coins;
      }

    }

    const useStripeCheckout = paymentMethod === "stripe" && totalAmount > 0;
    if (!useStripeCheckout) {
      user.coins -= coinsUsed;
    }

    const newOrder = new Order({
      userId: user._id,
      products,
      totalAmount,
      paymentStatus: totalAmount === 0 ? "Completed" : "Pending",
      paymentMethod: totalAmount === 0 ? "Wallet/Coins" : paymentMethod,
      paymentProvider: totalAmount === 0 ? "Wallet/Coins" : "Stripe",
      coinsUsed,
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

    if (useStripeCheckout) {
      if (!stripe) {
        return res.status(500).json({
          error: "Stripe is not configured on the server"
        });
      }

      try {
        const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
        const lineItems = user.cart.map((item) => {
          const markedUpPrice = Math.ceil(item.productId.price * 1.1);
          return {
            price_data: {
              currency: "inr",
              product_data: {
                name: item.productId.title || "Product",
                description: item.productId.description || "",
              },
              unit_amount: Math.round(markedUpPrice) * 100,
            },
            quantity: item.quantity,
          };
        });

        const session = await stripe.checkout.sessions.create({
          payment_method_types: ["card"],
          mode: "payment",
          line_items: lineItems,
          client_reference_id: String(user._id),
          metadata: { orderId: String(newOrder._id) },
          success_url: `${frontendUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${frontendUrl}/checkout/cancel`,
        });

        newOrder.stripeSessionId = session.id;
        await newOrder.save();

        return res.status(200).json({
          checkoutUrl: session.url,
          orderId: newOrder._id
        });
      } catch (stripeError) {
        console.error("Stripe checkout session error:", stripeError);
        return res.status(502).json({
          error: "Stripe session creation failed",
          orderId: newOrder._id
        });
      }
    }

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
      orderDate: new Date()
    });

    await userHistory.save();

    user.cart = [];
    await user.save();

    res.status(200).json({
      message: "Payment processed and order placed successfully",
      success: true,
      orderId: newOrder._id,
      coinsDeducted: coinsUsed
    });
  } catch (err) {
    console.error("Payment error:", err);
    res.status(500).json({
      error: "Something went wrong"
    });
  }
};

// --- DASHBOARD DATA CONTROLLERS ---

const getDonatedProductsController = async (req, res) => {
  try {
    const userId = req.userId;
    const { timePeriod } = req.query; // 'week', 'month', 'year', 'all'

    let filter = { user_id: userId };

    if (timePeriod && timePeriod !== 'all') {
      const now = new Date();
      let startDate = new Date(0);
      if (timePeriod === 'week') {
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
      } else if (timePeriod === 'month') {
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
      } else if (timePeriod === 'year') {
        startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
      }
      filter.created_at = { $gte: startDate };
    }

    const products = await SellProduct.find(filter);
    const user = await User.findById(userId).select("firstname");

    const dataWithImages = products.map(item => ({
      _id: item._id,
      username: user.firstname,
      items: item.items,
      fabric: item.fabric,
      size: item.size,
      gender: item.gender,
      readableUsage: item.usageDuration > 1 ? '> 1 year' : 'Less than 1 year',
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
};

const getOrderHistoryController = async (req, res) => {
  try {
    const userId = req.userId;
    const { timePeriod } = req.query; // 'week', 'month', 'year', 'all'

    const userHistory = await UserHistory.findOne({ userId })
      .populate({
        path: "orders.products.productId",
        model: "Product",
        select: "title description price category image"
      })
      .populate({
        path: "orders.orderId",
        model: "Order",
        select: "createdAt"
      });

    if (!userHistory) {
      return res.json({ success: true, orders: [] });
    }

    let startDate = null;
    if (timePeriod && timePeriod !== 'all') {
      const now = new Date();
      if (timePeriod === 'week') {
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
      } else if (timePeriod === 'month') {
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
      } else if (timePeriod === 'year') {
        startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
      }
    }

    const formattedOrders = userHistory.orders
      .map(order => {
        const originalOrder = order.orderId;
        const finalDate = order.orderDate || (originalOrder ? originalOrder.createdAt : new Date());

        return {
          ...order.toObject(),
          orderId: originalOrder ? originalOrder._id : order.orderId,
          orderDate: finalDate
        };
      })
      .filter(order => {
        if (!startDate) return true;
        return new Date(order.orderDate) >= startDate;
      });

    res.json({
      success: true,
      orders: formattedOrders
    });
  } catch (error) {
    console.error("Error fetching order history:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// --- REVIEWS CONTROLLERS ---
import Review from '../models/Reviews.js';

const createReviewController = async (req, res) => {
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
};

const deleteReviewController = async (req, res) => {
  try {
    const reviewId = req.params.id;
    const userId = req.userId;

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ success: false, message: "Review not found." });
    }

    if (review.user.toString() !== userId) {
      return res.status(403).json({ success: false, message: "Not authorized to delete this review." });
    }

    await Review.findByIdAndDelete(reviewId);

    await Product.findByIdAndUpdate(review.product, {
      $pull: { reviews: reviewId }
    });

    await User.findByIdAndUpdate(userId, {
      $pull: { reviews: reviewId }
    });

    res.json({ success: true, message: "Review deleted successfully." });

  } catch (error) {
    console.error("Error deleting review:", error);
    res.status(500).json({
      message: "Server Error",
      success: false
    })
  }
};

// --- SELL/DONATE PRODUCT CONTROLLER ---
import multer from 'multer';
import { classifyImage } from '../utils/classifier.js';

const combinationPoints = {
  "CottonS6": 200, "CottonM6": 250, "CottonL6": 300,
  "SilkS6": 300, "SilkM6": 350, "SilkL6": 400,
  "LinenS6": 220, "LinenM6": 270, "LinenL6": 320,
  "LeatherS6": 450, "LeatherM6": 550, "LeatherL6": 600,
  "CashmereS6": 400, "CashmereM6": 450, "CashmereL6": 500,
  "SyntheticS6": 120, "SyntheticM6": 150, "SyntheticL6": 180,
  "WoolS6": 250, "WoolM6": 320, "WoolL6": 370,
  "DenimS6": 270, "DenimM6": 320, "DenimL6": 400,
  "PolyesterS6": 100, "PolyesterM6": 120, "PolyesterL6": 150,
  "CottonS1": 140, "CottonM1": 180, "CottonL1": 220,
  "SilkS1": 220, "SilkM1": 260, "SilkL1": 300,
  "LinenS1": 160, "LinenM1": 200, "LinenL1": 240,
  "LeatherS1": 300, "LeatherM1": 350, "LeatherL1": 400,
  "CashmereS1": 260, "CashmereM1": 320, "CashmereL1": 350,
  "SyntheticS1": 70, "SyntheticM1": 90, "SyntheticL1": 110,
  "WoolS1": 180, "WoolM1": 220, "WoolL1": 260,
  "DenimS1": 160, "DenimM1": 200, "DenimL1": 240,
  "PolyesterS1": 60, "PolyesterM1": 80, "PolyesterL1": 100,
};

const sellProductController = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Photo is required.'
      });
    }

    if (req.file && req.file.buffer) {
      try {
        console.log("Verifying second-hand product image...");
        const classification = await classifyImage(req.file.buffer);

        if (!classification.is_cloth) {
          return res.status(400).json({
            success: false,
            message: "Image verification failed: The uploaded image does not appear to be a cloth."
          });
        }

        console.log(`Image verified. Predicted Category: ${classification.category}`);
        req.body.items = classification.category;

      } catch (mlError) {
        console.error("ML Verification Error:", mlError);
        return res.status(500).json({
          success: false,
          message: "Image verification service unavailable."
        });
      }
    }

    const combination_id = req.body.fabric + req.body.size + req.body.age;
    const estimated_value = combinationPoints[combination_id];

    if (estimated_value === undefined) {
      return res.status(400).json({
        success: false,
        message: `Invalid combination: ${combination_id}. Please check your input.`
      });
    }

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

    res.status(201).json({
      success: true,
      message: "Product submitted successfully. Coins will be added after verification!",
      product: newProduct
    });

  } catch (error) {
    console.error('Error submitting product:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};

// --- FILTER PRODUCTS CONTROLLER ---
const filterProductsController = async (req, res) => {
  try {
    const {
      category,
      material,
      gender,
      size,
      minPrice,
      maxPrice
    } = req.query;

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
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    const filteredProducts = await Product.find(filter).populate('reviews');

    const markedUpProducts = filteredProducts.map(p => {
      const pObj = p.toObject();
      pObj.price = Math.ceil(pObj.price * 1.1);
      return pObj;
    });

    res.status(200).json({
      success: true,
      products: markedUpProducts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error filtering products",
      error: error.message
    });
  }
};

// --- GET DASHBOARD STATS CONTROLLER ---
const getUserDashboardStatsController = async (req, res) => {
  try {
    const userId = req.userId;
    const { timePeriod } = req.query; // 'week', 'month', 'year', 'all'

    // Calculate start date based on timePeriod
    const now = new Date();
    let startDate = new Date(0); // For 'all'
    if (timePeriod === 'week') {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
    } else if (timePeriod === 'month') {
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    } else if (timePeriod === 'year') {
      startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
    }

    // 1. Fetch Orders within date range
    const orders = await Order.find({
      userId,
      createdAt: { $gte: startDate }
    }).populate('products.productId');

    let totalOrders = orders.length;
    let moneySpent = 0;

    // Category aggregation
    const categoryCounts = {};

    orders.forEach(order => {
      // Only count completed/processing orders towards money spent
      if (order.paymentStatus !== 'Failed' && order.paymentStatus !== 'Refunded' && order.orderStatus !== 'Cancelled') {
        moneySpent += order.totalAmount;
      }

      order.products.forEach(item => {
        if (item.productId && item.productId.category) {
          const cat = item.productId.category;
          categoryCounts[cat] = (categoryCounts[cat] || 0) + item.quantity;
        }
      });
    });

    // Sort categories by frequency
    const sortedCategories = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1]);

    let topCategory = sortedCategories.length > 0 ? sortedCategories[0][0] : 'None';
    let secondCategory = sortedCategories.length > 1 ? sortedCategories[1][0] : 'None';

    // 2. Fetch Secondhand clothes within date range
    const secondhandClothes = await SellProduct.find({
      user_id: userId,
      created_at: { $gte: startDate }
    });

    let clothesGiven = secondhandClothes.length;
    let coinsGained = 0;

    secondhandClothes.forEach(cloth => {
      // Users gain virtual coins. For estimated values counting towards total gained.
      // Usually coins are added after verification/Sold. Even if they are just listed, we might show potential or actual.
      // Let's sum if adminStatus is 'Sold' or 'Verified', else count it generally if we want to show all. We'll count what is Sold or Verified as "gained". The schema has adminStatus: Pending, Sold
      if (cloth.adminStatus === 'Sold') {
        coinsGained += cloth.estimated_value || 0;
      }
    });

    res.json({
      success: true,
      data: {
        totalOrders,
        clothesGiven,
        moneySpent,
        coinsGained,
        topCategory,
        secondCategory,
        timePeriod: timePeriod || 'all'
      }
    });

  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export { loginController, signupController, logoutController, renderCartController, addToCartController, removeFromCartController, deleteFromCartController, loginPageRenderController, signupPageRenderController, accountRenderController, addressRenderController, blogController, shopController, vendorsController, blogRenderController, HomePageController, accountShowRenderController, getAccountDetailsController, updateAccountController, getAddressDetailsController, updateAddressController, getAllProductsController, getBlogByIdController, getAllBlogsController, addItemToCartController, decreaseCartQuantityController, deleteItemFromCartController, getCheckoutDetailsController, processPaymentController, getDonatedProductsController, getOrderHistoryController, createReviewController, deleteReviewController, sellProductController, filterProductsController, getUserDashboardStatsController }