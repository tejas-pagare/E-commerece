import express from "express";
import User from "../models/user.js";
import Product from "../models/product.js";
import Seller from "../models/seller.js";
const router = express.Router();

router.get("/login", (req, res) => {
  return res.render('admin/login/index.ejs', { title: 'login', role: "admin" })
})

router.get("/secondHand", (req, res) => {
  return res.render("admin/secondhandProducts/index.ejs", { title: "secondHandProduct", role: "admin" });
})

router.get("/dashboard", async (req, res) => {

  const users = await User.find({}).populate(["cart.productId", "products"]);
  const products = await Product.find({}).populate("sellerId");
  let totalCartAmount = 0;
  let customerOrders = 0;
  let sellerOrders = 0;
  let UserCount = 0;
  users.forEach(user => {
    if (user.role === "user") {
      UserCount += 1;
      user.cart.forEach(cartItem => {
        if (cartItem.productId) {
          totalCartAmount += cartItem.productId.price * cartItem.quantity;
        }
      });
      customerOrders += user.cart.length;
    } else if (user.role === "seller") {
      sellerOrders += user.products.length;
    }
  });

  res.render("admin/dashboard/index.ejs", {
    title: "Dashboard",
    role: "admin",
    totalCartAmount,
    customerOrders,
    CustomerCount: UserCount,
    registeredProducts: products
  });
})
router.post("/dashboard", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (email !== "adminLogin@gmail.com" && password !== "swiftmart") {
      res.redirect("/api/v1/user/login");
    }
    res.redirect("/api/v1/admin/dashboard");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

router.get("/customers", async (req, res) => {
  const customers = await User.find({});
  console.log(customers);
  return res.render("admin/Customers/index.ejs", { title: "Customers", role: "admin", customers });
});

router.get("/customer/details", async (req, res) => {
  try {
    const customers = await User.find({});
    return res.json({
      customers
    })
  } catch (error) {
    return res.json({
      message: "Server error",
      sucess: false
    })
  }
})
router.get("/products", (req, res) => {
  return res.render("admin/Products/index.ejs", { title: "Products", role: "admin" });
})

router.get("/vendors", (req, res) => {
  res.render("User/Vendor/index.ejs", { title: 'Vendors', role: "admin" });
});

router.delete("/product/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const product = await Product.findByIdAndDelete(id, { new: true });
    await Seller.findOneAndUpdate({ _id: product._id }, { $pull: { id } })
    res.json({
      message: "Product deleted successfully",
      sucess: true
    })
  } catch (error) {
    res.json({
      message: "Server Error",
      success: false
    })
  }
})

router.get("/products/details", async (req, res) => {
  try {
    const products = await Product.find({}).populate("sellerId");
    console.log(products);
    return res.json({
      products
    })
  } catch (error) {
    res.json({
      message: "Sever Error",
      sucess: false
    })
  }
});

router.delete("/customer/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const user = await User.findById(id);
    if (!user) {
      return res.json({
        message: "No user with give id exists",
        sucess: false
      })
    }

    await user.deleteOne();
    return res.json({
      message: "User deleted sucessFully",
      sucess: true
    })
  } catch (error) {
    return res.json({
      message: "Server error",
      sucess: false
    })
  }
});


router.get("/product/approve/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const product = await Product.findById(id);
    if (!id) {
      res.json({
        message: "Error in approving",
        success: true
      })
    }
    product.verified = true;
    await product.save();
    res.json({
      message: "Product approved successfully",
      success: true
    })
  } catch (error) {
    res.json({
      message: "Server Error",
      sucess: false
    })
  }
});

router.get("/product/disapprove/:id",async(req,res)=>{
  try {
    const id = req.params.id;
    const product = await Product.findById(id);
    if(!product){
      return res.json({
        message:"No such Product exits",
        success:false
      })
    }
    product.verified=false;
    await product.save();
    return res.json({
      message:"Product disapproved successfully",
      success:true
    })
  } catch (error) {
    res.json({
      message:"Server Error",
      success:false
    })
  }
})

router.get("/seller", (req, res) => {
  res.render("admin/Sellers/index.ejs", { title: "Sellers", role: "admin" });
});

router.get("/seller/approve/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const seller = await Seller.findById(id);
    if (!seller) {
      return res.json({
        message: "No Such user exist",
        success: false
      })
    }
    seller.identityVerification.status = "Verified"
    await seller.save();
    res.json({
      message: "Seller approved successfully",
      success: true
    })
  } catch (error) {
    res.json({
      message: "Server Error",
      sucess: false
    })
  }
})

router.get("/seller/details", async (req, res) => {
  try {
    const sellers = await Seller.find({});
    res.json({
      sellers,
      success: true,
      message: "Seller retireved Successfully"
    })
  } catch (error) {
    res.json({
      message: "Server Error",
      success: false
    })
  }
});



export default router