import express from "express";
import jwt from "jsonwebtoken"
const isAuthenticated = async(req,res,next)=>{
try {
  const token = req.cookie.token;
  if(!token){
    return res.status(400).json({
      messgae:"You are not authorized ",
      success:false
    })
  }

  const decode = jwt.decode(token,"JWT_SECRET");
  if(!decode){
    return res.status(400).json({
      messgae:"Token is not valid",
      success:false
    })
  }
  req.userId = decode.userId;
  next();
} catch (error) {
  return res.status(500).json({
    messgae:"Server error",
    success:false
  })
}
}