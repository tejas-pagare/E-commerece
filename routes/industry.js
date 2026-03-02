import express from 'express';
import { industryAuth } from '../middleware/isAuthenticated.js';
import { 
    loginController, 
    registerController, 
    logoutController,
    getHomeController,
    fetchHomeController,
    getProfileController,
    getEditProfileController,
    postEditProfileController,
    getCheckoutController,
    postCheckoutController,
    getCartController,
    postCartController,
    deleteCartController,
    getDashboardController,
    createStripeCheckoutSession
} from '../controller/industry.js';

const router = express.Router();

router.post('/login', loginController);
router.post('/signup', registerController);

router.get("/logout", industryAuth, logoutController);

router.get('/home', industryAuth, getHomeController);

router.get('/fetchhome', industryAuth, fetchHomeController);

router.get("/profile", industryAuth, getProfileController);

router.get("/profile/edit", industryAuth, getEditProfileController);

router.post("/profile/edit", industryAuth, postEditProfileController);

router.get('/checkout', industryAuth, getCheckoutController);

router.post('/checkout', industryAuth, postCheckoutController);

router.get('/cart', industryAuth, getCartController);

router.post('/cart', industryAuth, postCartController);

router.post('/cart/delete', industryAuth, deleteCartController);

router.get("/dashboard", industryAuth, getDashboardController);

router.post('/create-checkout-session', industryAuth, createStripeCheckoutSession);

export default router;