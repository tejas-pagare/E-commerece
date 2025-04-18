import express from 'express';
import SellProduct from '../models/SellProduct.js';
import Industry from '../models/Industry.js';
import industryAuth from '../middleware/isAuthenticated.js';
import { loginController, registerController } from '../controller/industry.js';
import {v4 as uuidv4} from 'uuid';
const router = express.Router();

router.get('/login', (req,res)=>{
    res.render('Industry/login', {title:'Login', role:'User'})
} );
router.get('/register', (req, res) => {
    res.render('Industry/register', {title:'Register',role:'User'})
})
router.post('/login', loginController );
router.post('/register', registerController);

router.get('/about',industryAuth ,(req, res) => {
    res.render('Industry/about', {title:'About',role:'User'})
})
router.get('/home', industryAuth, async (req, res) => {
    try {
        const combinations = await SellProduct.aggregate([
          {
            $match: {
              adminStatus: "Pending",  // Only select products where adminStatus is "Pending"
              userStatus: "Verified"   // Only select products where userStatus is "Verified"
            }
          },
          {
            $group: {
              _id: "$combination_id", // Group by combination_id
              quantity: { $sum: 1 },  // Count the number of products in each combination
              fabric: { $first: "$fabric" },  // Get first fabric value
              size: { $first: "$size" },  // Get first size value
              usageDuration: { $first: "$usageDuration" } // Get first usage duration
            }
          },
          {
            $limit: 54 // Limit to 54 unique combination_id groups
          }
        ]);

        res.render('Industry/home', { title: 'Home', role:'User' ,combinations });
    } catch (error) {
        console.error("Error fetching combinations with details:", error);
        res.status(500).json({ message: "Internal Server Error", error });
    }
});


router.get('/cart', industryAuth, async( req,res)=>{
    try {
        const id= req.industry;
        const industry = await Industry.findById(id);
        res.render('Industry/cart', {title:'Cart', role:'User', industryName: industry.companyName, email: industry.email, address: industry.address, cart: industry.cart});
    }
        catch (error) {
        console.error("Error fetching industry:", error);}
})

router.post('/cart',industryAuth ,async(req,res)=>{
    try {
        const { _id, quantity, fabric, size, usageDuration, new_quantity, amount } = req.body;
        
        const cartItem= {
            fabric:fabric,
            size: size,
            usageDuration: usageDuration,
            quantity: new_quantity,
            amount: amount,
            combination_id: _id,
            id:uuidv4(),
        }

        // this is about admin specific
        // const updatedProduct = await SellProduct.updateMany(
        //     { combination_id: _id, adminStatus: "Pending" }, 
        //     { $set: { adminStatus: "Sold" } }, 
        //     { limit: new_quantity } // Ensures only the required quantity gets updated
        // ); 


        // this is about industry specific
        const id= req.industry;
        const updatedIndustry = await Industry.findByIdAndUpdate(
            id,
            { $push: { cart: cartItem } },
            { new: true } // Returns the updated document
          );

          res.render('Industry/cart', {title:'Cart', role:'User',updatedIndustry: updatedIndustry})
        
    } catch (error) {
        console.error("Error fetching product:", error);
        res.status(500).json({msg:'Server Error'})
    }
})

router.post('/cartDelete', industryAuth ,async(req,res)=>{
    try {
        const { combination_id, id } = req.body;
        const iid= req.industry;
        const updatedIndustry = await Industry.findByIdAndUpdate(
            iid,
            { $pull: { cart: { id:id } } },
            { new: true } // Returns the updated document
             )
        res.render('Industry/cart', {title:'Cart', role:'User', updatedIndustry: updatedIndustry})}
          catch (error) {
        console.error("Error deleting product from cart:", error);}

});

router.get('profile', industryAuth ,async (req,res)=>{
    try {
        const id= req.industry;
        const industry = await Industry.findById(id);
        res.render('Industry/profile', {title:'Profile', role:'User', industryName: industry.companyName, email: industry.email, address: industry.Address});
    }
        catch (error) {
        console.error("Error fetching industry:", error);}
        
})

router.get('profile/edit',industryAuth ,async (req,res)=>{
    try {
        const id= req.industry;
        const industry = await Industry.findById(id);
        res.render('Industry/editProfile', {title:'Profile update', role:'User',companyName: industry.companyName, email: industry.email, address: industry.Address});
    }catch (error) {
        console.error("Error fetching industry:", error);}
    
})

router.post('profile/edit', industryAuth, async (req,res)=>{
    try {
        const { companyName, email, address } = req.body;
        const id= req.industry;
        const industry = await Industry.findByIdAndUpdate(id, { companyName, email, address }, { new: true });
        res.redirect('/industry/profile');
    } catch (error) {
        console.error("Error updating industry profile:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
})

router.get('/checkout', industryAuth, async (req,res)=>{
    try {
        const id= req.industry;
        const industry = await Industry.findById(id);
        res.render('Industry/checkout', {title:'Checkout', role:'User', industryName: industry.companyName, email: industry.email, address: industry.address, cart: industry.cart});
    } catch (error) {
        console.error("Error fetching industry:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
})

export default router;
