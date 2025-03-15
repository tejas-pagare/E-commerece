import express from "express";
import jwt from "jsonwebtoken"
import User from "../models/user.js";
const isAuthenticated = async(req,res,next)=>{
try {
  const token = req.cookies.token;
  if(!token){
    return res.redirect("/api/v1/user/login");

  }

  const decode = jwt.decode(token,"JWT_SECRET");
  if(!decode){
    return res.redirect("/api/v1/user/login");

  }
  const user = await User.findById(decode.userId);
  console.log(user?.role)
  req.role = user?.role || "admin";
  req.userId = decode.userId;
  next();
} catch (error) {
  console.log(error);
  console.log("/error")
  return res.redirect("/api/v1/user/login");

}
}

export default isAuthenticated;