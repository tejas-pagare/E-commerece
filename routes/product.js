import express from "express";
import Product from "../models/product.js";

const router = express.Router();

router.get("/details/:id", async (req, res) => {
  try {
    const id = req.params.id;

    // --- THIS IS THE FIX ---
    // We are now populating both 'reviews' (with the user)
    // AND 'sellerId' (to get the storeName)
    const product = await Product.findById(id)
      .populate({
        path: 'reviews',
        populate: {
          path: 'user',
          select: 'firstname lastname' // Only select the fields you need
        }
      })
      .populate('sellerId', 'storeName'); // <-- THIS LINE WAS MISSING
    // --- END OF FIX ---

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    // Also find related products to send along with the main product
    const relatedProducts = await Product.find({
      category: product.category,
      _id: { $ne: product._id } // Exclude the main product itself
    }).limit(4); // Limit to 4 related products

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