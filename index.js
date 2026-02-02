import express from 'express';
import http from "http";
import { Server as SocketIOServer } from "socket.io";
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
const corsOptions = {
  origin:[ "http://localhost:8000","http://localhost:5174","http://localhost:5173"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE","PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.use(session({
  secret: "secret-swiftmart",
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 600000 },
}))
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

const server = http.createServer(app);
const io = new SocketIOServer(server, { cors: corsOptions });

io.on("connection", (socket) => {
  console.log(`Socket connected: ${socket.id}`);
  socket.on("disconnect", () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

// Emit refresh events after successful mutations
app.use((req, res, next) => {
  res.on("finish", () => {
    const method = req.method?.toUpperCase();
    if (["POST", "PUT", "PATCH", "DELETE"].includes(method) && res.statusCode < 400) {
      io.emit("backend-updated", {
        method,
        path: req.originalUrl,
        status: res.statusCode,
        at: new Date().toISOString(),
      });
    }
  });
  next();
});
app.use("/api/v1/user", userController);
app.use("/api/v1/product", productRouter);
app.use("/api/v1/seller",sellerRouter);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/industry", industryRouter);
app.use("/api/v1/manager", managerRouter);


app.get("/", (req, res) => {
  res.json({ message: "Welcome to SwiftMart API" });
})

app.get("*", (req, res) => {
  
  res.json({
    message: "Acess denied"
  })
})



const PORT = 8000;
server.listen(PORT, () => {
  dbConnection();
  console.log(`Server running on http://localhost:${PORT}`)
});
