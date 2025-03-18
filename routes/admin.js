import express from "express";
import User from "../models/user.js";
import Product from "../models/product.js";
const router = express.Router();

router.get("/login", (req, res) => {
  return res.render('admin/login/index.ejs', { title: 'login', role: "admin" })
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

router.get("/customers",(req,res)=>{
  return res.render("admin/Customers/index.ejs",{title:"Customers",role:"admin"});
})
router.get("/products",(req,res)=>{
  return res.render("admin/Products/index.ejs",{title:"Products",role:"admin"});
})

router.get("/vendors",(req,res)=>{
  res.render("User/Vendor/index.ejs", { title: 'Vendors', role: "admin"});
})

export default router