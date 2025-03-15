import express from 'express';
const app = express();
import path from "path"
import expressLayouts from 'express-ejs-layouts'
import products from './data/products.js';
import blogPosts from "./data/blogId.json" assert { type: "json" };
import userController from "./routes/user.js"
import productRouter from "./routes/product.js"
import dbConnection from "./config/db.js"
import { fileURLToPath } from 'url';
import dotenv from "dotenv";
import { title } from 'process';
import cors from "cors"
import cookieParser  from "cookie-parser";
import Product from './models/product.js';
dotenv.config({});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(
  cors({
    origin: "http://localhost:8000", // Adjust this to your frontend URL
    credentials: true, // Allow cookies and authorization headers
    methods: ["GET", "POST", "PUT", "DELETE"], // Allowed methods
    allowedHeaders: ["Content-Type", "Authorization"], // Allowed headers
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }))
  ; app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, "public")));
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('layout', 'layouts/main');

app.use("/api/v1/user", userController);
app.use("/api/v1/product",productRouter);





app.get("/account", (req, res) => {
  res.render("account/index.ejs", { title: 'Account' });
})

app.get("/blog/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const blog = blogPosts.find(post => post.id === id);

  if (!blog) {
      return res.status(404).send("Blog post not found");
  }

  res.render("blog_post/article.ejs", {title:"Blog Article"  , blog });
});

app.get("/account/address", (req, res) => {
  res.render("account_address/index.ejs", { title: 'Account Address' });
})

app.get("/product",(req,res)=>{
  res.render("seller/Product/index.ejs",{title:"Create a new Product"})
})
app.get('/product/:id', (req, res) => {
  const { id } = req.params;
  const product = products.find(product => product.id === Number(id));
  let filteredProducts = products.filter(product => product.id !== id);
  filteredProducts = filteredProducts.slice(0, 5);
  res.render('product/index.ejs', { title: 'Product page', product, filteredProducts })
});

app.get('/blog', (req, res) => res.render('blog/index.ejs', { title: 'Blog Page' }));
app.get('/contact', (req, res) => res.render('contact/index.ejs', { title: 'Contact Page' }));

app.get("/dashboard",(req,res)=>{
  res.render("admin/dashboard/index.ejs",{title: 'Dashboard'});
})
const PORT = 8000;
app.listen(PORT, () => {
  dbConnection();
  console.log(`Server running on http://localhost:${PORT}`)
});
