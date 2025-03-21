import express from 'express';
import { accountRenderController, accountShowRenderController, addressRenderController, addToCartController, blogController, blogRenderController, cartRenderController, deleteFromCartController, HomePageController, loginController, loginPageRenderController, logoutController, removeFromCartController, renderCartController, shopController, signupController, signupPageRenderController, vendorsController } from '../controller/user.js';
import User from '../models/user.js';
import isAuthenticated from '../middleware/isAuthenticated.js';
import { title } from 'process';
import Product from '../models/product.js';


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

    // Add category filter if present
    if (filter?.category) {
      query.category = filter.category;
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

router.get("/account/address", isAuthenticated, addressRenderController)
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
router.get('/', isAuthenticated, HomePageController);


export default router;