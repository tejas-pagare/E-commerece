import express from 'express';
import isAuthenticated from '../middleware/isAuthenticated.js';
import Seller from '../models/seller.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken'
import Product from '../models/product.js';
const router = express.Router();

router.get("/login", (req, res) => {
  res.render('seller/auth/login.ejs', { title: 'login', error: "", role: "seller" });
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const sellerCheck = await Seller.findOne({ email });
    if (!sellerCheck) {
      return res.redirect("/api/v1/seller/login")
    }

    const token = jwt.sign({ userId: sellerCheck._id, role: "seller" }, "JWT_SECRET", { expiresIn: "5h" });

    console.log(token);

    // Set token as a cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      maxAge: 3600000,
    });

    return res.redirect("/api/v1/seller")
    // res.json({
    //   token
    // })

  } catch (error) {
    console.log(error);

    res.redirect("/api/v1/seller/login")
  }
})


router.get("/signup", (req, res) => {

  res.render('seller/auth/signup.ejs', { title: 'signup', error: "", role: "seller" });

});


router.post("/signup", async (req, res) => {
  try {
    const { name, password, email, gstn, profileImage } = req.body;
    const sellerCheck = await Seller.findOne({ email });
    if (sellerCheck) {
      return res.redirect("/api/v1/seller/signup")
    }

    const hashPassword = await bcrypt.hash(password, 10);

    const seller = Seller.create({
      name, password: hashPassword, email, gstn, profileImage
    });
    (await seller).save()

    return res.redirect("/api/v1/seller/login");
    // res.json({
    //   message: "User registered successfully"
    // })
  } catch (error) {
    console.log(error);
    return res.redirect("/api/v1/seller/signup")
    // res.json({
    //   message: "Server error"
    // })
  }
});

router.get("/logout", isAuthenticated, (req, res) => {
  res.clearCookie("token");
  return res.redirect("/");
})


router.get("/create", isAuthenticated, (req, res) => {
  console.log(req.role)

  return res.render("seller/Product/index.ejs", { title: 'Create Product', role: "seller" });
})
router.post("/create", isAuthenticated, async (req, res) => {
  try {

    const { title, price, description, category, image,quantity,stock } = req.body;
    const userId = req.userId;
    if (!title || !price || !description || !category || !image||!quantity) {
      return res.json({
        message: "All fields are required",
        success:false
      });
    }
    const newProduct = await Product.create({
      sellerId: userId,
      title,
      price,
      description,
      category,
      image,
      quantity,
      stock
    });

    const seller = await Seller.findById(userId);
    if (!seller) {
      return res.status(404).json({ error: "Seller not found" });
    }
    console.log(seller)
    seller.products.push(newProduct);
    await seller.save();
    return res.json({
      message:"Create Product",
      success:true
    })
    // res.json({
    //   message:"Product added sucessfully"
    // })


  } catch (error) {
    console.log(error);
    return res.json({
      message: "Server error",
      success:false
    })
  }
});
router.post("/update/:id", isAuthenticated, async (req, res) => {
  try {
    
    const id = req.params.id;
    const { title, price, description,image,quantity,stock } = req.body;
    console.log(quantity);
    const product = await Product.findById(id);
    if(title)product.title=title;
    if(price)product.price=price;
    if(description)product.description = description;
    if(image)product.image=image;
    if(quantity)product.quantity=quantity;
    if(stock!==(null||undefined))product.stock=stock
    await product.save();
    return res.json({
      message:"product updated successfully",
      success:true
    });


  } catch (error) {
    console.log(error);
    return res.json({
      message: "Server error",
      success:false
    })
  }
});
router.get("/update/:id",isAuthenticated,async(req,res)=>{
  try {
    const id = req.params.id;
    const product = await Product.findById(id);
    res.render("seller/updateProduct/index.ejs",{title:"Update Product",role:"seller",product});
    return;
  } catch (error) {
    res.redirect("/api/v1/seller");
    return;
  }
})


router.delete("/product/:id", isAuthenticated, async (req, res) => {
  try {
    const id = req.params.id;
  //  console.log("ProductsId",id)
    const seller = await Seller.findById(req.userId);
  //  console.log(seller)
    const checkProducts = seller.products.find((e) => (e).toString() === id);
    
    if (!checkProducts) {
    return  res.json({
        message: "Error in removing product"
      })
    }
 
    await Promise.all([Seller.findOneAndUpdate({_id:req.userId},{$pull:{"products":id}},{new:true}),Product.findByIdAndDelete(id)]);
    console.log("sucess")
   return res.json({
      message: "Products removed successfully",
      success:true
    })
  } catch (error) {
    res.json({
      message: "Internal server error",
      success:false
    })
  }
});

router.get("/account", isAuthenticated, async(req, res) => {
  const seller = await Seller.findById(req.userId);
  res.render("Seller/profile/show.ejs", { title: 'Account', role: req.role,seller });
});

router.get("/account/update", isAuthenticated, async(req, res) => {
  const seller = await Seller.findById(req.userId);
  res.render("Seller/profile/index.ejs", { title: 'Account', role: req.role,seller });
});
router.post("/account/update", isAuthenticated, async(req,res)=>{
  const {name,gstn, email} = req.body;
  console.log(name,gstn, email)
  try {
    if(!email || !name || !gstn){
      return res.redirect("/api/v1/seller/account");
    }
    await Seller.findByIdAndUpdate(req.userId, {name,gstn,email})
    res.json({
      message:"Account updated successfully"
    });
    return;
  } catch (error) {
    return res.redirect("/api/v1/seller/account");
  }
});

router.get("/", isAuthenticated, async (req, res) => {
  try {

    const userId = req.userId;
    console.log(userId)
    const productListed = await Seller.findById(userId).populate("products");

    return res.render("seller/listedProduct/index.ejs", { title: "Listed Product", role: "seller", productListed: productListed?.products })
    // return res.json({
    //   productListed: productListed?.products
    // })
  } catch (error) {
    res.json({
      message: "Intenal error"
    })
  }
})

export default router;