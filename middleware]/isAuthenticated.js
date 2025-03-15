import express from "express";
import jwt from "jsonwebtoken"
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
  req.userId = decode.userId;
  next();
} catch (error) {
  console.log(error)
  return res.redirect("/api/v1/user/login");

}
}

export default isAuthenticated;