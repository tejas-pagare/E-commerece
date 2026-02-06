import express from 'express';
import http from "http";
import { Server as SocketIOServer } from "socket.io";
const app = express();
import session from 'express-session';
import fs from "fs";
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
import jwt from "jsonwebtoken";
import bodyParser from "body-parser";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import csurf from "csurf";
import { createStream } from "rotating-file-stream";
dotenv.config({});

// Fail fast on missing critical env vars
if (!process.env.JWT_SECRET) {
  console.error("FATAL: JWT_SECRET is not defined in .env");
  process.exit(1);
}
if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) {
  console.error("FATAL: ADMIN_EMAIL or ADMIN_PASSWORD is not defined in .env");
  process.exit(1);
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const corsOptions = {
  origin:[ "http://localhost:8000","http://localhost:5174","http://localhost:5173"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE","PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
const logsDir = path.join(__dirname, "logs");
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}
const accessLogStream = createStream("access.log", {
  size: "5M",
  interval: "1d",
  compress: "gzip",
  path: logsDir,
});
app.use(morgan("combined", { stream: accessLogStream }));
app.use(session({
  secret: "secret-swiftmart",
  resave: false,
  saveUninitialized: false,
  cookie: { 
    maxAge: 600000,
    httpOnly: true,
    secure: false, // set to true if using HTTPS
    sameSite: 'lax'
  },
}))
app.use(cookieParser());
app.use(bodyParser.json({ limit: "2mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "2mb" }));
app.use(express.static(path.join(__dirname, "public")));

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api/", apiLimiter);

const csrfProtection = csurf({
  cookie: {
    httpOnly: true,
    sameSite: "lax",
    secure: false, // set to true if using HTTPS
  },
});

app.use((req, res, next) => {
  if (req.path.startsWith("/api/") && req.path !== "/api/v1/csrf-token") {
    return next();
  }
  return csrfProtection(req, res, next);
});

// Clear invalid auth token cookies on every request
app.use((req, res, next) => {
  const token = req.cookies?.token;
  if (!token) {
    return next();
  }
  try {
    jwt.verify(token, "JWT_SECRET");
    return next();
  } catch (err) {
    res.clearCookie("token", {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
    });
    return next();
  }
});

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
app.get("/api/v1/csrf-token", (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
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
  
  res.status(404).json({
    message: "Access denied (Route not found)"
  })
})



const PORT = 8000;
server.listen(PORT, () => {
  dbConnection();
  console.log(`Server running on http://localhost:${PORT}`)
});
