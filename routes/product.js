import express from "express";
import Product from "../models/product.js";

const router = express.Router();




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

    res.render('product/index.ejs', { title: 'Product page', product, filteredProducts:product })

  } catch (error) {
    return res.json({
      messag: "Server error"
    })
  }
});


router.post("/", async (req, res) => {
  try {
   
    const { title, price, description, category, image,userId } = req.body;
    if (!title || !price || !description || !category || !image) {
      return res.json({
        messag: "All fields are required"
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

    return res.json({
      product: newProduct
    })


  } catch (error) {
    return res.json({
      messag: "Server error"
    })
  }
});

export default router;