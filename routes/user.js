import express from 'express';
import path from 'path';
import { promises as fs } from 'fs';
import products from '../data/products.js';
import { error } from 'console';
import User from '../models/user.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Product from '../models/product.js';
import isAuthenticated from '../middleware]/isAuthenticated.js';
import { title } from 'process';
const router = express.Router();
router.get('/', isAuthenticated,async (req, res) => {
  try {
    const products = await Product.find({});
    res.render('homepage/index.ejs', { title: 'Home', products });

  } catch (error) {
    console.log(error);
  }
}
)
router.get("/login", (req, res) => {
  res.render('user/login.ejs', { title: 'login', error: "" })
})

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const userCheck = await User.findOne({ email });
    if (!userCheck) {
      res.redirect("/api/v1/user/login")
    }

    const token = jwt.sign({ userId: userCheck._id }, "JWT_SECRET", { expiresIn: "1h" });

    console.log(token);

    // Set token as a cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      maxAge: 3600000,
    });

    res.redirect("/api/v1/user/")


  } catch (error) {
    console.log(error)
    res.redirect("/api/v1/user/login")
  }
})



router.get("/signup",isAuthenticated, (req, res) => {
  res.render('user/signup.ejs', { title: 'signup' })
})

router.post("/signup", async (req, res) => {
  try {
    const { firstname, lastname, password, email, role } = req.body;
    const userCheck = await User.findOne({ email });
    if (userCheck) {
      return res.redirect("/api/v1/user/signup")
    }

    const hashPassword = await bcrypt.hash(password, 10);
    console.log(hashPassword);
    const user = User.create({
      firstname, lastname, password: hashPassword, email, role: role.toLowerCase()
    });
    (await user).save()

    return res.redirect("/api/v1/user/login");
  } catch (error) {
    console.log(error);
    return res.redirect("/api/v1/user/signup")
  }
});

router.get("/logout",isAuthenticated,(req,res)=>{

})

router.get("/cart",(req,res)=>{
  res.render("cart/index.ejs",{title:"Cart"});
})
router.post("/cart",isAuthenticated,async(req,res)=>{
  try {
    const userId = req.userId;
    const user = await User.findById(userId).populate("cart.productId");
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ cart: user.cart });
  } catch (error) {
    
  }
})



router.post("/cart/add/:id", isAuthenticated, async (req, res) => {
  try {
    const id = req.params.id;
    console.log(id)
    const userId = req.userId
    if (!id) {
      return res.json({
        message: "No product id provided"
      })
    }
    const product = await Product.findOne({ _id: id });
    if (!product) {
      return res.json({
        message: "No such product"
      })
    }

    const user = await User.findById(userId);
    const productCartCheck = user.cart.find(item => item.productId.equals(product._id));

    if (!productCartCheck) {
      user.cart.push({
        productId: product._id,
        quantity: 1
      });
    } else {
      productCartCheck.quantity += 1;
    }
    (await user).save();
    res.json({
      message:"updated cart"
    })

  } catch (error) {
    console.log(error)
    return res.json({
      messag: "Server error"
    })
  }
})

router.post("/cart/remove/:id", isAuthenticated, async (req, res) => {
  try {
    const id = req.params.id;
    const userId = req.userId
    if (!id) {
      return res.json({
        message: "No product id provided"
      })
    }
    const product = await Product.findOne({ _id: id });
    if (!product) {
      return res.json({
        message: "No such product"
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
      message:"updated cart"
    })

  } catch (error) {
    console.log(error)
    return res.json({
      messag: "Server error"
    })
  }
})

router.delete("/cart/remove/:id", isAuthenticated, async (req, res) => {
  try {
    const id = req.params.id;
    const userId = req.userId
    if (!id) {
      return res.json({
        message: "No product id provided"
      })
    }
    const product = await Product.findOne({ _id: id });
    if (!product) {
      return res.json({
        message: "No such product"
      })
    }

    const user = await User.findById(userId);
    const productCartCheck = user.cart.find(item => item.productId.equals(product._id));

    if (productCartCheck) {
      user.cart.remove(productCartCheck);
    }
    (await user).save();
    res.json({
      message:"updated cart"
    })
  } catch (error) {
    return res.json({
      messag: "Server error"
    })
  }
})

export default router;