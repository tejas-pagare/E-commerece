import express from 'express';
import isAuthenticated from '../middleware/isAuthenticated.js';
import Seller from '../models/seller.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken'
import Product from '../models/product.js';
const router = express.Router();

router.get("/login", (req, res) => {
  res.render('seller/auth/login.ejs', { title: 'login', error: "", role: "seller" });
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const sellerCheck = await Seller.findOne({ email });
    if (!sellerCheck) {
      return res.redirect("/api/v1/seller/login")
    }

    const token = jwt.sign({ userId: sellerCheck._id, role: "seller" }, "JWT_SECRET", { expiresIn: "5h" });

    console.log(token);

    // Set token as a cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      maxAge: 3600000,
    });

    return res.redirect("/api/v1/seller")
    // res.json({
    //   token
    // })

  } catch (error) {
    console.log(error);

    res.redirect("/api/v1/seller/login")
  }
})


router.get("/signup", (req, res) => {

  res.render('seller/auth/signup.ejs', { title: 'signup', error: "", role: "seller" });

});


router.post("/signup", async (req, res) => {
  try {
    const { name, password, email, gstn, profileImage } = req.body;
    const sellerCheck = await Seller.findOne({ email });
    if (sellerCheck) {
      return res.redirect("/api/v1/seller/signup")
    }

    const hashPassword = await bcrypt.hash(password, 10);

    const seller = Seller.create({
      name, password: hashPassword, email, gstn, profileImage
    });
    (await seller).save()

    return res.redirect("/api/v1/seller/login");
    // res.json({
    //   message: "User registered successfully"
    // })
  } catch (error) {
    console.log(error);
    return res.redirect("/api/v1/seller/signup")
    // res.json({
    //   message: "Server error"
    // })
  }
});

router.get("/logout", isAuthenticated, (req, res) => {
  res.clearCookie("token");
  return res.redirect("/api/v1/seller/login");
})


router.get("/create", isAuthenticated, (req, res) => {
  console.log(req.role)

  return res.render("seller/Product/index.ejs", { title: 'Create Product', role: "seller" });
})
router.post("/create", isAuthenticated, async (req, res) => {
  try {

    const { title, price, description, category, image } = req.body;
    const userId = req.userId;
    if (!title || !price || !description || !category || !image) {
      return res.json({
        message: "All fields are required"
      });
    }
    const newProduct = await Product.create({
      sellerId: userId,
      title,
      price,
      description,
      category,
      image
    });

    const seller = await Seller.findById(userId);
    if (!seller) {
      return res.status(404).json({ error: "Seller not found" });
    }
    console.log(seller)
    seller.products.push(newProduct);
    await seller.save();
    res.redirect("/api/v1/seller");
    // res.json({
    //   message:"Product added sucessfully"
    // })


  } catch (error) {
    console.log(error);
    return res.json({
      message: "Server error"
    })
  }
});

router.delete("/product/:id", isAuthenticated, async (req, res) => {
  try {
    const id = req.params;
    const seller = await Seller.findById(req.userId);
    const checkProducts = seller.products.find((e) => (e).toString() === id);
    if (!checkProducts) {
      res.json({
        message: "Error in removing product"
      })
    }
    seller.products = seller.products((e) => (e).toString() !== id);
    (await seller).save();
    res.json({
      message: "Products removed successfully"
    })
  } catch (error) {
    res.json({
      message: "Internal server error"
    })
  }
})

router.get("/", isAuthenticated, async (req, res) => {
  try {

    const userId = req.userId;
    console.log(userId)
    const productListed = await Seller.findById(userId).populate("products");

    return res.render("seller/listedProduct/index.ejs", { title: "Listed Product", role: "seller", productListed: productListed?.products })
    // return res.json({
    //   productListed: productListed?.products
    // })
  } catch (error) {
    res.json({
      message: "Intenal error"
    })
  }
})

export default router;