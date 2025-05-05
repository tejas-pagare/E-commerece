import express from 'express';
import { accountRenderController, accountShowRenderController, addressRenderController, addToCartController, blogController, blogRenderController, cartRenderController, deleteFromCartController, HomePageController, loginController, loginPageRenderController, logoutController, removeFromCartController, renderCartController, shopController, signupController, signupPageRenderController, vendorsController } from '../controller/user.js';
import User from '../models/user.js';
import isAuthenticated from '../middleware/isAuthenticated.js';
import { title } from 'process';
import Product from '../models/product.js';
import Review from '../models/Reviews.js';

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

router.post("/sell", async (req, res) => {
  try {
    const filter = req.query;
   

    const query = {};
    query.verified = true;

    // Add category filter if present
    if (filter?.category) {
      query.category = filter.category.toLowerCase();
    }

    
    if (filter?.min || filter?.max) {
      query.price = {};
      if (filter?.min) query.price.$gte = Number(filter.min);
      if (filter?.max) query.price.$lte = Number(filter.max);
    }
    console.log(query)
    const products = await Product.find(query);

    res.status(200).json({
      message: "Retrieved Products",
      products,
      success: true,
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({
      message: "Some error occurred",
      success: false,
    });
  }
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




export default router;