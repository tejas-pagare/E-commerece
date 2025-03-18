import express from 'express';
import { accountRenderController, addressRenderController, addToCartController, blogController, blogRenderController, cartRenderController, deleteFromCartController, HomePageController, loginController, loginPageRenderController, logoutController, removeFromCartController, renderCartController, shopController, signupController, signupPageRenderController, vendorsController } from '../controller/user.js';
import { error } from 'console';
import User from '../models/user.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Product from '../models/product.js';
import isAuthenticated from '../middleware/isAuthenticated.js';
import { title } from 'process';


const router = express.Router();
router.get('/', isAuthenticated, HomePageController)
router.get("/login", loginPageRenderController)
router.post("/login", loginController)
router.get("/signup", signupPageRenderController)
router.post("/signup",signupController);
router.get("/logout", isAuthenticated, logoutController);
router.get("/account", isAuthenticated, accountRenderController)
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