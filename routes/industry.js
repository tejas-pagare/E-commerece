import express from 'express';
import SellProduct from '../models/SellProduct.js';
import Industry from '../models/Industry.js';
import {industryAuth} from '../middleware/isAuthenticated.js';
import { loginController, registerController } from '../controller/industry.js';
import {v4 as uuidv4} from 'uuid';
const router = express.Router();

router.get('/login', (req,res)=>{
    res.render('Industry/Auth/login', {title:'Login', role:'User'})
} );
router.get('/signup', (req, res) => {
    res.render('Industry/Auth/signup', {title:'Signup',role:'User'})
})
router.post('/login', loginController );
router.post('/signup', registerController);

router.get('/about',industryAuth ,(req, res) => {
    res.render('Industry/aboutus/aboutus', {title:'About',role:'Industry'})
})
router.get('/home', industryAuth, async (req, res) => {
    try {
        console.log(req.industry);
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
              quantity: { $sum: 1 },
              estimated_value:{$first: "$estimated_value"},  // Count the number of products in each combination
              fabric: { $first: "$fabric" },  // Get first fabric value
              size: { $first: "$size" },  // Get first size value
              usageDuration: { $first: "$usageDuration" } // Get first usage duration
            }
          },
          {
            $limit: 54 // Limit to 54 unique combination_id groups
          }
        ]);
         console.log(req.industry);
        res.render('Industry/homepage/home', { title: 'Home', role:'User' ,combinations });
    } catch (error) {
        console.error("Error fetching combinations with details:", error);
        res.status(500).json({ message: "Internal Server Error", error });
    }
});


router.get('/cart', industryAuth, async( req,res)=>{
    try {
        const id= req.industry;
        const industry = await Industry.findById(id);
        res.render('Industry/newCart/cart', {title:'Cart', role:'User', industryName: industry.companyName, email: industry.email, address: industry.address, cart: industry.cart});
    }
        catch (error) {
        console.error("Error fetching industry:", error);}
})

router.post('/cart',industryAuth ,async(req,res)=>{
    try {
        const { _id, quantity, fabric, size, usageDuration, new_quantity, estimated_value } = req.body;
        
        const cartItem= {
            fabric:fabric,
            size: size,
            usageDuration: usageDuration,
            quantity: new_quantity,
            amount: estimated_value*new_quantity,
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

          res.render('Industry/newCart/cart', {title:'Cart', role:'User',updatedIndustry: updatedIndustry})
        
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
        res.render('Industry/cart', {title:'Cart', role:'Industry', updatedIndustry: updatedIndustry})}
          catch (error) {
        console.error("Error deleting product from cart:", error);}

});

router.get("/profile", industryAuth, async (req, res) => {
    try {
        const id = req.industry;
        console.log(id);
      const industry = await Industry.findById(id)
     console.log(industry);
      if (!industry) {
        return res.status(404).render("error", {
          message: "Industry profile not found",
          error: { status: 404 },
        })
      }
  
      res.render("Industry/Profile/profile", {
        title: "Profile",
        role: "Industry",
        industryName: industry.companyName,
        email: industry.email,
        address: industry.Address || "No address provided",
      })
    } catch (error) {
      console.error("Error fetching industry:", error)
      res.status(500).render("error", {
        message: "Error fetching profile",
        error: { status: 500 },
      })
    }
  })

  router.get("/profile/edit", industryAuth, async (req, res) => {
    try {
      const id = req.industry
      const industry = await Industry.findById(id)
  
      if (!industry) {
        return res.status(404).render("error", {
          message: "Industry profile not found",
          error: { status: 404 },
        })
      }
  
      res.render("Industry/profile/editProfile", {
        title: "Profile Update",
        role: "Industry",
        companyName: industry.companyName,
        email: industry.email,
        address: industry.Address || "",
      })
    } catch (error) {
      console.error("Error fetching industry:", error)
      res.status(500).render("error", {
        message: "Error fetching profile for editing",
        error: { status: 500 },
      })
    }
  })
  

  router.post("/profile/edit", industryAuth, async (req, res) => {
    try {
      const { companyName, email, address, password } = req.body
       hashpassword = await bcrypt.hash(password, 10);
  
      // Validate input
      if (!companyName || !email || !address || !password) {
        return res.status(400).render("Industry/profile/editProfile", {
          title: "Profile Update",
          role: "User",
          companyName: companyName || "",
          email: email || "",
          address: address || "",
          password: hashpassword || "", 
          error: "All fields are required",
        })
      }
  
      const id = req.industry
  
      // Update the industry profile
      // Note: Using both Address and address to ensure compatibility
      const industry = await Industry.findByIdAndUpdate(
        id,
        {
          companyName,
          email,
          Address: address, 
          password,
        },
        { new: true },
      )
  
      if (!industry) {
        return res.status(404).render("error", {
          message: "Industry profile not found",
          error: { status: 404 },
        })
      }
  
      res.redirect("/industry/profile")
    } catch (error) {
      console.error("Error updating industry profile:", error)
      res.status(500).render("Industry/profile/editProfile", {
        title: "Profile Update",
        role: "User",
        companyName: req.body.companyName || "",
        email: req.body.email || "",
        address: req.body.address || "",
        password: req.body.password || "",
        error: "An error occurred while updating your profile",
      })
    }
  })

router.get('/checkout', industryAuth, async (req,res)=>{
    try {
        const id= req.industry;
        const industry = await Industry.findById(id);
        res.render('Industry/checkout/checkout', {title:'Checkout', role:'User', industryName: industry.companyName, email: industry.email, address: industry.address, cart: industry.cart});
    } catch (error) {
        console.error("Error fetching industry:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
})

// Assuming you have an Order model and industryAuth middleware

router.get('/dashboard', industryAuth, async (req, res) => {
    try {
      const industryId = req.industry;
      // Fetch orders for this industry
      const orders = await Order.find({ industry: industryId }).sort({ createdAt: -1 });
      // Calculate total amount
      const totalAmount = orders.reduce((sum, order) => sum + order.totalAmount, 0);
      res.render('Industry/dashboard', { orders, totalAmount });
    } catch (error) {
      console.error(error);
      res.status(500).render('error', { message: 'Could not load dashboard' });
    }
  });
  


export default router;
