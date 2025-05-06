import express from 'express';
import SellProduct from '../models/SellProduct.js';
import Industry from '../models/Industry.js';
import {industryAuth} from '../middleware/isAuthenticated.js';
import { loginController, registerController } from '../controller/industry.js';
import {v4 as uuidv4} from 'uuid';
import bcrypt from 'bcryptjs';
const router = express.Router();

router.get('/login', (req,res)=>{
    res.render('Industry/Auth/login', {title:'Login', role:'User'})
} );
router.get('/signup', (req, res) => {
    res.render('Industry/Auth/signup', {title:'Signup',role:'User'})
})
router.post('/login', loginController );
router.post('/signup', registerController);

router.get("/logout", industryAuth, (req,res)=>{
  res.clearCookie("token");
  return res.redirect("/");
});

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
/////////////////////////////////////////////////////////upperdone/////////////////////
router.get("/blog", industryAuth, (req,res)=>{
    res.render("Industry/blog/blog", {title:'Blog', role:'Industry' });
})

///////////////////////////////////////////////////////////////////done////////////
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
//////////////////////////////////////////////////////////////////////////////done/////////
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
  
//done//////////////////////////////////////////////////////////////////done
  router.post("/profile/edit", industryAuth, async (req, res) => {
    try {
      const { companyName, email, address, password } = req.body;
      const id = req.industry;
      const existingIndustry = await Industry.findById(id);
  
      if (!existingIndustry) {
        return res.status(404).render("error", {
          message: "Industry profile not found",
          error: { status: 404 },
        });
      }
  
      // Handle password
      let newPassword = existingIndustry.password;
      const isMatch = await bcrypt.compare(password, newPassword);
          if (!isMatch) {
            newPassword = await bcrypt.hash(password, 10);
          }
      // Only hash if the password is changed (and not left blank)
  
      // Update the industry profile
      const industry = await Industry.findByIdAndUpdate(
        id,
        {
          companyName,
          email,
          Address: address, // Make sure schema matches
          password: newPassword,
        },
        { new: true }
      );
  
      if (!industry) {
        return res.status(404).render("error", {
          message: "Industry profile not found",
          error: { status: 404 },
        });
      }
  
      res.redirect("/");
    } catch (error) {
      console.error("Error updating industry profile:", error);
      res.status(500).render("Industry/profile/editProfile", {
        title: "Profile Update",
        role: "Industry",
        companyName: req.body.companyName || "",
        email: req.body.email || "",
        address: req.body.address || "",
        password: "",
        error: "An error occurred while updating your profile",
      });
    }
  });
  /////////////////////////////////////////////undone
  router.get('/checkout', industryAuth, async (req, res) => {
    try {
        const id = req.industry; // Get the industry ID from the authenticated request
        const industry = await Industry.findById(id); // Fetch the industry document from the database

        // If no industry found with the given ID, return an error
        if (!industry) {
            return res.status(404).json({ message: "Industry not found" });
        }

        // Render the checkout page, passing the necessary details
        res.render('Industry/checkout/checkout', {
            title: 'Checkout',
            role: 'Industry', // Role should be 'Industry' since we are rendering for industry
            industryName: industry.companyName,
            email: industry.email,
            address: industry.address,
            cart: industry.cart
        });

    } catch (error) {
        console.error("Error fetching industry:", error);
        // Send a 500 error response with a message
        res.status(500).json({ message: "Internal Server Error" });
    }
});
/////////////////////////////////////////////////////////////done////////////
router.get('/cart', industryAuth, async (req, res) => {
    try {
        const id = req.industry;
        const industry = await Industry.findById(id);
        
        // Check if cart exists, otherwise initialize it as an empty array
        const cart = industry.cart || []; 
        
        res.render('Industry/newCart/cart', {
            title: 'Cart',
            role: 'Industry',
            industryName: industry.companyName,
            email: industry.email,
            address: industry.address,
            cart: cart
        });
    } catch (error) {
        console.error("Error fetching industry:", error);
        res.status(500).json({ msg: 'Server Error' });
    }
});

router.post('/cart', industryAuth, async (req, res) => {
    try {
        const { _id, quantity, fabric, size, usageDuration, new_quantity, estimated_value } = req.body;

        const cartItem = {
            fabric: fabric,
            size: size,
            usageDuration: usageDuration,
            quantity: new_quantity,
            amount: estimated_value * new_quantity,
            combination_id: _id,
            id: uuidv4(),
        };

        // Update the cart for the specific industry
        const id = req.industry;
        const updatedIndustry = await Industry.findByIdAndUpdate(
            id,
            { $push: { cart: cartItem } },
            { new: true } // Returns the updated document
        );

        // Fetch the updated cart and render it again
        const cart = updatedIndustry.cart || [];

        res.render('Industry/newCart/cart', {
            title: 'Cart',
            role: 'Industry',
            industryName: updatedIndustry.companyName,
            email: updatedIndustry.email,
            address: updatedIndustry.address,
            cart: cart
        });

    } catch (error) {
        console.error("Error fetching product:", error);
        res.status(500).json({ msg: 'Server Error' });
    }
});

router.post('/cartDelete', industryAuth, async (req, res) => {
    try {
        const { combination_id, id } = req.body;
        const iid = req.industry;

        // Ensure that we are working with the correct industry
        const updatedIndustry = await Industry.findByIdAndUpdate(
            iid,
            { $pull: { cart: { id: id } } }, // Pull the item with matching `id` from the cart array
            { new: true } // Return the updated document after the update operation
        );

        // Check if the cart was updated successfully and exists
        const updatedCart = updatedIndustry.cart || [];

        // Render the updated cart page
        res.render('Industry/newCart/cart', {
            title: 'Cart',
            role: 'Industry',
            updatedIndustry: updatedIndustry,
            cart: updatedCart
        });

    } catch (error) {
        console.error("Error deleting product from cart:", error);
        // Render an error page or send an error response
        res.status(500).send("Error occurred while deleting item from cart.");
    }
});
// /////////////////////////////////////////////
// router.get('/dashboard', industryAuth, async (req, res) => {
//     try {
//       const industryId = req.industry;
//       // Fetch orders for this industry
//       const orders = await industry.findById(industryId).dashboard;
//       // Calculate total amount
//       const totalAmount = orders.reduce((sum, order) => sum + order.totalAmount, 0);
//       res.render('Industry/Dashboard/dashboard', { orders, totalAmount });
//     } catch (error) {
//       console.error(error);
//       res.status(500).render('error', { message: 'Could not load dashboard' });
//     }
//   });
router.post('/checkout', industryAuth, async (req, res) => {
    try {
      const industryId = req.industry;
      const industry = await Industry.findById(industryId);
  
      if (!industry) {
        return res.status(404).json({ message: 'Industry not found' });
      }
  
      const cartItems = industry.cart;
  
      // For each cart item
      for (const item of cartItems) {
        const { combination_id, quantity } = item;
  
        // Update first `quantity` SellProduct entries to Sold
        const products = await SellProduct.find({
          combination_id: combination_id,
          adminStatus: 'Pending'
        }).limit(quantity);
  
        const productIdsToUpdate = products.map(p => p._id);
  
        await SellProduct.updateMany(
          { _id: { $in: productIdsToUpdate } },
          { $set: { adminStatus: 'Sold' } }
        );
  
        // Push to dashboard
        industry.dashboard.push(item);
      }
  
      // Clear cart
      industry.cart = [];
  
      await industry.save();
  
      res.render('Industry/Dashboard/dashboard', {
        title: 'Dashboard',
        role: 'Industry',
        orders: industry.dashboard,
        totalAmount: industry.dashboard.reduce((acc, item) => acc + item.amount, 0)
      });
  
    } catch (error) {
      console.error('Checkout error:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });
  
  router.get("/dashboard", industryAuth ,async (req, res) => {
    try {
      // Assume user is authenticated and ID is available
      const Id = req.industry;
      console.log(Id);
      if (!Id) {
        return res.status(400).send("Industry ID missing");
      }
  
      const industry = await Industry.findById(Id);
      if (!industry) {
        return res.status(404).send("Industry not found");
      }
  
      const orders = industry.dashboard || [];
      const totalAmount = orders.reduce((sum, order) => sum + (order.amount || 0), 0);
  
      res.render("Industry/Dashboard/dashboard", {
        title: 'Dashboard',
        role: 'Industry',
        orders,
        totalAmount,
      });
    } catch (err) {
      console.error("Dashboard error:", err);
      res.status(500).send("Server error");
    }
  });
export default router;
