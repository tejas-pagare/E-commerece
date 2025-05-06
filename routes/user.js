import express from 'express';
import { accountRenderController, accountShowRenderController, addressRenderController, addToCartController, blogController, blogRenderController, cartRenderController, deleteFromCartController, HomePageController, loginController, loginPageRenderController, logoutController, removeFromCartController, renderCartController, shopController, signupController, signupPageRenderController, vendorsController } from '../controller/user.js';
import User from '../models/user.js';
import isAuthenticated from '../middleware/isAuthenticated.js';
import { title } from 'process';
import Product from '../models/product.js';
import Review from '../models/Reviews.js';
import SellProduct from '../models/SellProduct.js';

import Order from "../models/orders.js";
import UserHistory from "../models/userHistory.js";
import path from 'path';
const router = express.Router();

router.get("/login", loginPageRenderController)
router.post("/login", loginController)
router.get("/signup", signupPageRenderController)
router.post("/signup", signupController);
router.get("/logout", isAuthenticated, logoutController);
router.get("/account", isAuthenticated, accountShowRenderController);
router.get("/account/update", isAuthenticated, accountRenderController);
router.post("/account/update", isAuthenticated, async (req, res) => {
  const { firstname, lastname, email } = req.body;

  try {
    if (!email || !firstname || !lastname) {
      return res.redirect("/api/v1/user/account");
    }
    await User.findByIdAndUpdate(req.userId, { firstname, lastname, email })
    res.redirect("/api/v1/user/account");
    return;
  } catch (error) {
    return res.redirect("/api/v1/user/account");
  }
});
router.get("/sell", isAuthenticated, async (req, res) => {
  res.render("User/sell/index.ejs", { title: "Sell Product", role: "user" });

});
router.get("/store", (req, res) => {
  return res.render("User/store/index.ejs", { title: "Store", role: "user" });
});


router.get("/account/address", isAuthenticated, addressRenderController);
router.get("/account/update/address",isAuthenticated,async(req,res)=>{
  const user = await User.findById(req.userId);
  console.log(user);
  res.render("User/accountAddress/edit.ejs", { title: 'Update Account Address', role: "user",user });
})
router.post( "/account/update/address",isAuthenticated,async(req,res)=>{

try {
  
  const {plotno,street,city,state,pincode,phone} = req.body;
  if(!plotno||!street||!city||!state||!pincode||!phone){
    return res.status(400).json({
      messag:"Enter all fields",
      success:false
    })
  }
  const user = await User.findById(req.userId);
  if(plotno) user.Address.plotno = plotno;
  if(street) user.Address.street = street;
  if(city) user.Address.city = city;
  if(state) user.Address.state = state;
  if(pincode) user.Address.pincode = pincode;
  if(phone) user.Address.phone = phone;
  await user.save();
  res.status(200).json({
    message:"Address updated sucessfully",
    success:true
  })
} catch (error) {
  res.status(500).json({
    message:"Something went Wrong",
    success:false
  })
}
})
router.get("/blog/:id", isAuthenticated, blogController);
router.get("/shop", isAuthenticated, shopController);
router.get("/vendors", isAuthenticated, vendorsController)
router.get('/blog', isAuthenticated, blogRenderController);
router.get('/contact', isAuthenticated, (req, res) => res.render('User/contact/index.ejs', { title: 'Contact Page', role: "user" }));
router.get("/cart", cartRenderController)
router.post("/cart", isAuthenticated, renderCartController)
router.post("/cart/add/:id", isAuthenticated, addToCartController)
router.post("/cart/remove/:id", isAuthenticated, removeFromCartController)
router.delete("/cart/remove/:id", isAuthenticated, deleteFromCartController);
router.get("/checkout",isAuthenticated,async(req,res)=>{
  const user = await User.findById(req.userId).populate("cart.productId");
  console.log(user);
  let total =0;
  user.cart?.forEach((e)=>{
    total += Math.round(e?.productId?.price)*e.quantity
  })
  return res.render("User/payment/index.ejs",{title:"Checkout Page",role:"user",user,total})
});
router.post("/payment", isAuthenticated, async (req, res) => {
  try {
    const { paymentMethod, address } = req.body;
    const { userId } = req;
console.log(address);
    if (
      !address ||
      !address.plotno ||
      !address.street ||
      !address.city ||
      !address.state ||
      !address.pincode
    ) {
      return res.status(400).json({ error: "Shipping address is incomplete" });
    }

    const user = await User.findById(userId).populate("cart.productId");
    if (!user) return res.status(404).json({ error: "User not found" });
    if (user.cart.length === 0) return res.status(400).json({ error: "Cart is empty" });

    const products = user.cart.map((item) => ({
      productId: item.productId._id,
      quantity: item.quantity,
      price: item.productId.price,
    }));

    const totalAmount = products.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );

    const newOrder = new Order({
      userId: user._id,
      products,
      totalAmount,
      paymentStatus:"Pending",
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

    let userHistory = await UserHistory.findOne({ userId: user._id });
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
      status: "Completed",
    });

    await userHistory.save();

    user.cart = [];
    await user.save();

    res.status(200).json({ message: "Payment processed and order placed successfully" });
  } catch (err) {
    console.error("Payment error:", err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

router.get("/dashboard/sellproduct", isAuthenticated, async (req, res) => {
  try {
    const userId = req.userId;
    console.log(userId);
    const products = await SellProduct.find({ user_id: userId });
    const name= await User.findById(userId).select("firstname");

    // Only send required 9 fields + formatted image + readable usage
    const dataWithImages = products.map(item => ({
      name: name.firstname,
      size: item.size,
      gender: item.gender,
      fabric: item.fabric,
      usageDuration: item.usageDuration,
      readableUsage: item.usageDuration > 1 ? '> 1 year' : '< 6 months',
      imageSrc: item.image?.data
        ? `data:${item.image.contentType};base64,${item.image.data.toString('base64')}`
        : null,
      clothesDate: item.clothesDate,
      timeSlot: item.timeSlot,
      userStatus: item.userStatus,
      estimated_value: item.estimated_value
    }));

    res.render("User/dashboard/sellproduct/dummyboard", {title:"sellproduct",role:"user", products: dataWithImages, username:name.firstname });

  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

router.get("/dashboard", isAuthenticated, async (req, res) => {
  const userId = req.userId;
  console.log(userId);
  
  const order = await UserHistory.findOne({ userId })
    .populate({
      path: "userId",
      select: "firstname lastname email",
      populate: {
        path: "cart"
      }
    })
    .populate({
      path: "orders",
      populate: {
        path: "products.productId", // 👈 correct path
        model: "Product"            // 👈 use correct model name
      }
    });

  console.log(order);
  res.render("User/dashboard/index.ejs", { title: "Dashboard", role: "user", order });
});


router.post("/review/create/:id",isAuthenticated,async(req,res)=>{
  try {
    const id = req.params.id;
    
    const {description,rating} = req.body;
   
    if(!description||!id||!rating){
      return res.json({
        message:"Please Enter all fields",
        success:false
      })
    }

    const review = await Review.create({
      user:req.userId,
      product:id,
      rating:Number(rating),
      description
    });

    await Promise.all([
      review.save(),
      User.findByIdAndUpdate(req.userId,{$push:{reviews:review._id}}),
      Product.findByIdAndUpdate(id,{$push:{reviews:review._id}})
    ]);
    res.json({
      message:"Review Created Sucessfully",
      success:true
    })
  } catch (error) {
    res.json({
      message:"Server Error",
      success:false
    })
  }
})
router.get('/', isAuthenticated, HomePageController);


const combinationPoints = {
  // 6 months (age = "6")
  "CottonS6": 200, "CottonM6": 250, "CottonL6": 300,
  "SilkS6": 300, "SilkM6": 350, "SilkL6": 400,
  "LinenS6": 220, "LinenM6": 270, "LinenL6": 320,
  "LeatherS6": 450, "LeatherM6": 550, "LeatherL6": 600,
  "CashmereS6": 400, "CashmereM6": 450, "CashmereL6": 500,
  "SyntheticS6": 120, "SyntheticM6": 150, "SyntheticL6": 180,
  "WoolS6": 250, "WoolM6": 320, "WoolL6": 370,
  "DenimS6": 270, "DenimM6": 320, "DenimL6": 400,
  "PolyesterS6": 100, "PolyesterM6": 120, "PolyesterL6": 150,
  // More than 1 year (age = "1")
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

import multer from 'multer';
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// POST /sell route
router.post('/sell', isAuthenticated,upload.single('photos'), async (req, res) => {
  try {
    // Validate file presence
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Photo is required.' });
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

// Add this route for filtered products
router.get("/products/filter", isAuthenticated, async (req, res) => {
  try {
    const { category, material, gender, size, minPrice, maxPrice } = req.query;
    
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
