import express from "express";
import Product from "../models/product.js";
import isAuthenticated from "../middleware]/isAuthenticated.js";
import User from "../models/user.js";

const router = express.Router();

router.get("/create",isAuthenticated,(req,res)=>{
  console.log(req.role)

return res.render("seller/Product/index.ejs",{title:'Create Product',role:req.role});
})
router.post("/create", isAuthenticated,async (req, res) => {
  try {
    console.log("/create post")
    const { title, price, description, category, image } = req.body;
    const userId = req.userId;
    if (!title || !price || !description || !category || !image) {
      return res.json({
        message: "All fields are required"
      });
    }
    const newProduct = await Product.create({
      sellerId:userId,
      title,
      price,
      description,
      category,
      image
    });

    const user = await User.findById(userId);
    user.products.push(newProduct);
    await user.save();
    return res.redirect("/api/v1/user");


  } catch (error) {
    console.log(error);
    return res.json({
      message: "Server error"
    })
  }
});


router.get("/",isAuthenticated,async(req,res)=>{
try {
  console.log("/ post")
  const userId = req.userId;
  const productListed = await User.findById(userId).populate("products").select("products");
  res.json({
    productListed:productListed.products,
  })
} catch (error) {
  res.json({
    message:"Intenal error"
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

    res.render('product/index.ejs', { title: 'Product page', product, filteredProducts:product,role:req.role })

  } catch (error) {
    return res.json({
      message: "Server error"
    })
  }
});



export default router;