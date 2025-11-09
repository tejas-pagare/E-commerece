import express from "express";
import Product from "../models/product.js";

const router = express.Router();


router.get("/details/:id", async (req, res) => {
  try {
    const id = req.params.id;

    // 1. Find the main product AND populate the 'sellerId' field
    //    We only select the 'storeName' from the seller document
    const product = await Product.findById(id)
      .populate('sellerId', 'storeName'); // <-- CHANGE 1

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    // 2. Also find and populate related products
    const relatedProducts = await Product.find({
      category: product.category,
      _id: { $ne: product._id } // Exclude the main product itself
    })
    .populate('sellerId', 'storeName') // <-- CHANGE 2 (So brand names also work on related items)
    .limit(4); 

    // Now, 'product.sellerId' will be an object like: { _id: "...", storeName: "..." }
    res.json({ success: true, product, relatedProducts });

  } catch (error) {
    console.error("Error fetching product details:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});








router.get("/:id", (req, res) => {
  // We no longer fetch data here. We just render the template.
  // The 'role' and 'title' are still needed for the main layout.
  res.render('User/product/index.ejs', {
    title: 'Product Page',
    role: "user",
    // We pass the productId so the client-side script can use it
    productId: req.params.id
  });
});

export default router;