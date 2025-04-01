import jwt from 'jsonwebtoken';
import User from '../models/user.js';
import Product from '../models/product.js';
import bcrypt from 'bcryptjs';
import blogPosts from "../data/blogId.json" with {type:"json"}
const HomePageController = async (req, res) => {
  try {
    const products = await Product.find({verified:true});
    res.render('User/homepage/index.ejs', { title: 'HomePage', products, role: "user" });

  } catch (error) {
    console.log(error);
  }
}

const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;
    const userCheck = await User.findOne({ email });
    if (!userCheck) {
      return res.redirect("/api/v1/user/login");
    }
    
    const isMatch = await bcrypt.compare(password, userCheck.password);
    if (!isMatch) {
      return res.redirect("/api/v1/user/login");
    }

    const token = jwt.sign({ userId: userCheck._id, role: "user" }, "JWT_SECRET", { expiresIn: "5h" });

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      maxAge: 3600000,
    });

    res.redirect("/api/v1/user/");


  } catch (error) {
    console.log(error)
    res.redirect("/api/v1/user/login")
  }
}


const loginPageRenderController = (req, res) => {
  res.render('User/auth/login.ejs', { title: 'login', error: "", role: "" });
}


const signupPageRenderController = (req, res) => {


  res.render('User/auth/signup.ejs', { title: 'signup', role: "user" })

}
const signupController =  async (req, res) => {
  try {
    const { firstname, lastname, password, email } = req.body;
    const userCheck = await User.findOne({ email });
    if (userCheck) {
      return res.redirect("/api/v1/user/signup")
    }

    const hashPassword = await bcrypt.hash(password, 10);
    console.log(hashPassword);
    const user = User.create({
      firstname, lastname, password: hashPassword, email
    });
    (await user).save()

    return res.redirect("/api/v1/user/login");
  } catch (error) {
    console.log(error);
    return res.redirect("/api/v1/user/signup")
  }
}



const logoutController = (req, res) => {
  res.clearCookie("token");
  return res.redirect("/");
}

const renderCartController = async (req, res) => {
  try {
    const userId = req.userId;

    const user = await User.findById(userId).populate("cart.productId");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
      res.json({ cart: user.cart });
  } catch (error) {

  }
}

const cartRenderController =  (req, res) => {

  res.render("User/cart/index.ejs", { title: "Cart", role: "user" });
}
const addToCartController =  async (req, res) => {
  try {
    const id = req.params.id;
    console.log(id)
    const userId = req.userId
    if (!id) {
      return res.json({
        message: "No product id provided",
        success:false
      })
    }
    const product = await Product.findOne({ _id: id });
    if (!product) {
      return res.json({
        message: "No such product",
        success:false
      })
    }

    const user = await User.findById(userId);
    const productCartCheck = user.cart.find(item => item.productId.equals(product._id));

    if (!productCartCheck) {
      user.cart.push({
        productId: product._id,
        quantity: 1
      });
    } else {
      productCartCheck.quantity += 1;
    }
    (await user).save();
    res.json({
      message: "Product added",
      success:true
    })

  } catch (error) {
    console.log(error)
    return res.json({
      messag: "Server error",
      success:false
    })
  }
}

const removeFromCartController = async (req, res) => {
  try {
    const id = req.params.id;
    const userId = req.userId
    if (!id) {
      return res.json({
        message: "No product id provided",
        success:false
      })
    }
    const product = await Product.findOne({ _id: id });
    if (!product) {
      return res.json({
        message: "No such product",
        success:false
      })
    }

    const user = await User.findById(userId);
    const productCartCheck = user.cart.find(item => item.productId.equals(product._id));

    if (productCartCheck.quantity === 0) {
      user.cart.remove(productCartCheck);
    } else {
      productCartCheck.quantity -= 1;
    }
    (await user).save();
    res.json({
      message: "Product removed from cart",
      success:true
    })

  } catch (error) {
    console.log(error)
    return res.json({
      messag: "Server error",
      success:false
    })
  }
}


const deleteFromCartController = async (req, res) => {
  try {
    const id = req.params.id;
    const userId = req.userId
    if (!id) {
      return res.json({
        message: "No product id provided",
        success:false
      })
    }
    const product = await Product.findOne({ _id: id });
    if (!product) {
      return res.json({
        message: "No such product",
        success:false
      })
    }

    const user = await User.findById(userId);
    const productCartCheck = user.cart.find(item => item.productId.equals(product._id));

    if (productCartCheck) {
      user.cart.remove(productCartCheck);
    }
    (await user).save();
    res.json({
      message: "Product reomved from cart",
      success:true
    })
  } catch (error) {
    return res.json({
      messag: "Server error",
      success:false
    })
  }
}


const accountShowRenderController =async(req, res) => {
  const user = await User.findById(req.userId);
  res.render("User/account/show.ejs", { title: 'Account', role: req.role,user });
}
const accountRenderController =async(req, res) => {
  const user = await User.findById(req.userId);
  res.render("User/account/index.ejs", { title: 'Account', role: req.role,user });
}


const addressRenderController = async(req, res) => {
  const user = await User.findById(req.userId);
  res.render("User/accountAddress/index.ejs", { title: 'Account Address', role: req.role,user });
}

const blogController = (req, res) => {
  const id = parseInt(req.params.id);
  const blog = blogPosts.find(post => post.id === id);

  if (!blog) {
    return res.status(404).send("Blog post not found");
  }

  res.render("User/blog_post/article.ejs", { title: "Blog Article", blog, role: req.role });
}

const shopController = (req,res)=>{
  res.render("User/Shop/index.ejs", { title: 'Shop', role: req.role});
}


const vendorsController = (req,res)=>{
  res.render("User/Vendor/index.ejs", { title: 'Vendors', role: req.role});
}

const blogRenderController = (req, res) => res.render('User/blog/index.ejs', { title: 'Blog Page', role: req.role })

export {loginController ,signupController,logoutController,renderCartController,addToCartController,removeFromCartController,deleteFromCartController,loginPageRenderController,signupPageRenderController,accountRenderController,addressRenderController,blogController,shopController,vendorsController,blogRenderController,cartRenderController,HomePageController,accountShowRenderController}