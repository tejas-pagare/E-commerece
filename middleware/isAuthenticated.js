import express from "express";
import jwt from "jsonwebtoken"
import User from "../models/user.js";
import Seller from "../models/seller.js";
const isAuthenticated = async (req, res, next) => {
  const isApiRequest = req.originalUrl?.startsWith("/api/");
  try {
    
    const token = req.cookies.token;
    
    if (!token) {
      // Clear any stale cookies
      res.clearCookie("token", {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        path: '/'
      });

      if (isApiRequest) {
        return res.status(401).json({ success: false, message: "Authentication required" });
      }
      
      const wantsJson = 
        req.xhr || 
        req.is('application/json') || 
        (req.headers.accept && req.headers.accept.includes('application/json'));

      if (wantsJson) {
        return res.status(401).json({ success: false, message: "Authentication required" });
      }
      return res.redirect("/");
    }

    const decode = jwt.verify(token, process.env.JWT_SECRET || "your_jwt_secret_key_change_me");
    if (!decode) {
      res.clearCookie("token", {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        path: '/'
      });

      if (isApiRequest) {
        return res.status(401).json({ success: false, message: "Invalid token" });
      }

      const wantsJson = 
        req.xhr || 
        req.is('application/json') || 
        (req.headers.accept && req.headers.accept.includes('application/json'));

      if (wantsJson) {
        return res.status(401).json({ success: false, message: "Invalid token" });
      }
      return res.redirect("/");
    }
    
    let user = "";
    if (decode.role === "user") {
      user = await User.findById(decode.userId);
    } else {
      user = await Seller.findById(decode.userId);
    }
    
    // If user doesn't exist in database, clear cookie
    if (!user) {
      res.clearCookie("token", {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        path: '/'
      });

      if (isApiRequest) {
        return res.status(401).json({ success: false, message: "User not found" });
      }

      const wantsJson = 
        req.xhr || 
        req.is('application/json') || 
        (req.headers.accept && req.headers.accept.includes('application/json'));
      
      if (wantsJson) {
        return res.status(401).json({ success: false, message: "User not found" });
      }
      return res.redirect("/");
    }
    
    req.role = decode.role || "admin";
    req.userId = decode.userId;
   
    next();
  } catch (error) {
    console.log(error);
    // Clear cookie on any error
    res.clearCookie("token", {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      path: '/'
    });
    
    const wantsJson = 
      req.xhr || 
      req.is('application/json') || 
      (req.headers.accept && req.headers.accept.includes('application/json'));
    
    if (isApiRequest) {
      return res.status(401).json({ success: false, message: "Authentication failed" });
    }

    if (wantsJson) {
      return res.status(401).json({ success: false, message: "Authentication failed" });
    }
    return res.redirect("/");
  }
}

export default isAuthenticated;

const industryAuth= async (req,res,next)=>{
  try{
    const token= req.cookies.token || req.headers.authorization?.split(' ')[1];
    if(!token){
      return res.status(401).json({ message: "Authentication required. Please login.", redirect: "/api/v1/industry/login" });
    }
    const decode= jwt.verify(token, process.env.JWT_SECRET || "your_jwt_secret_key_change_me");
    if(!decode){
      return res.redirect("/api/v1/indusrty/login");
    }
    console.log(decode);

    req.industry= decode.industry_id;
    next();

  }
  catch(error){
    console.log(error)
    return res.status(401).json({ message: "Authentication failed. Please login.", redirect: "/api/v1/industry/login" });
  }
}


export{industryAuth};
