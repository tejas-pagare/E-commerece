import express from 'express';
import { accountRenderController, accountShowRenderController, addressRenderController, addToCartController, blogController, blogRenderController, cartRenderController, deleteFromCartController, HomePageController, loginController, loginPageRenderController, logoutController, removeFromCartController, renderCartController, shopController, signupController, signupPageRenderController, vendorsController } from '../controller/user.js';
import User from '../models/user.js';
import isAuthenticated from '../middleware/isAuthenticated.js';


const router = express.Router();
router.get('/', isAuthenticated, HomePageController)
router.get("/login", loginPageRenderController)
router.post("/login", loginController)
router.get("/signup", signupPageRenderController)
router.post("/signup",signupController);
router.get("/logout", isAuthenticated, logoutController);
router.get("/account", isAuthenticated, accountShowRenderController);
router.get("/account/update", isAuthenticated, accountRenderController);
router.post("/account/update", isAuthenticated, async(req,res)=>{
  const {firstname,lastname, email} = req.body;
  
  try {
    if(!email || !firstname || !lastname){
      return res.redirect("/api/v1/user/account");
    }
    await User.findByIdAndUpdate(req.userId, {firstname,lastname,email})
    res.redirect("/api/v1/user/account");
    return;
  } catch (error) {
    return res.redirect("/api/v1/user/account");
  }
});
router.get("/sell", isAuthenticated, async(req,res)=>{
  res.render("User/sell/index.ejs",{title:"Sell Product",role:"user"});

});
router.get("/account/address", isAuthenticated,addressRenderController)
router.get("/blog/:id", isAuthenticated, blogController);
router.get("/shop",isAuthenticated,shopController)
router.get("/vendors",isAuthenticated,vendorsController)
router.get('/blog', isAuthenticated, blogRenderController);
router.get('/contact', isAuthenticated, (req, res) => res.render('User/contact/index.ejs', { title: 'Contact Page', role: req.role }));
router.get("/cart",cartRenderController)
router.post("/cart", isAuthenticated, renderCartController)
router.post("/cart/add/:id", isAuthenticated, addToCartController)
router.post("/cart/remove/:id", isAuthenticated, removeFromCartController)
router.delete("/cart/remove/:id", isAuthenticated, deleteFromCartController);



export default router;