import express from 'express';
const app = express();
import session from 'express-session';
import path from "path"
import expressLayouts from 'express-ejs-layouts'
import userController from "./routes/user.js"
import productRouter from "./routes/product.js"
import sellerRouter from "./routes/seller.js"
import adminRouter from "./routes/admin.js"
import industryRouter from "./routes/industry.js"
import managerRouter from "./routes/manager.js"
import dbConnection from "./config/db.js"
import { fileURLToPath } from 'url';
import dotenv from "dotenv";
import cors from "cors"
import cookieParser from "cookie-parser";
import multer from "multer"
dotenv.config({});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(
  cors({
    origin: "http://localhost:8000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(session({
  secret: "secret-swiftmart",
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 600000 },
}))
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, "public")));
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('layout', 'layouts/main');
app.use("/api/v1/user", userController);
app.use("/api/v1/product", productRouter);
app.use("/api/v1/seller",sellerRouter);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/industry", industryRouter);
app.use("/api/v1/manager", managerRouter);


app.get("/", (req, res) => {
  res.render("Home/index.ejs", { title: "Home", role: "seller" });
})

app.get("*", (req, res) => {
  
  res.json({
    message: "Acess denied"
  })
})



const PORT = 8000;
app.listen(PORT, () => {
  dbConnection();
  console.log(`Server running on http://localhost:${PORT}`)
});
