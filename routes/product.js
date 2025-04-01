import express from "express";
import Product from "../models/product.js";
import isAuthenticated from "../middleware/isAuthenticated.js";
import User from "../models/user.js";

const router = express.Router();


router.get("/", isAuthenticated, async (req, res) => {
  try {

    const userId = req.userId;
    const productListed = await User.findById(userId).populate("products").select("products");
    
    return res.render("seller/listedProduct/index.ejs", { title: "Listed Product", role: req?.role, productListed: productListed?.products })
  } catch (error) {
    res.json({
      message: "Intenal error"
    })
  }
})
router.get("/:id", async (req, res) => {
  const id = req.params.id;

  try {
    const product = await Product.findOne({ _id: id });
    console.log(product);
    if (!product) {
      return res.json({
        messag: "No such product"
      });
    }
    const products = await Product.find({category:product.category,_id:{$ne:product._id}});
    res.render('User/product/index.ejs', { title: 'Product page', product, filteredProducts: product, role: "user",products })

  } catch (error) {
    return res.json({
      message: "Server error"
    })
  }
});



export default router;