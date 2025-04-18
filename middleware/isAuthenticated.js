import express from "express";
import jwt from "jsonwebtoken"
import User from "../models/user.js";
import Seller from "../models/seller.js";
const isAuthenticated = async (req, res, next) => {
  try {
    
    const token = req.cookies.token;
    
    if (!token) {
      return res.redirect("/");

    }

    const decode = jwt.decode(token, "JWT_SECRET");
    if (!decode) {
      return res.redirect("/");

    }
    let user = "";
    if (decode.role === "user") {
      user = await User.findById(decode.userId);

    } else {
      user = await Seller.findById(decode.userId);
    }
   
    
    req.role = decode.role || "admin";
    req.userId = decode.userId;
   
    next();
  } catch (error) {
    console.log(error);
    console.log("/error")
    return res.redirect("/");

  }
}

export default isAuthenticated;

const industryAuth= async (req,res,next)=>{
  try{
    const token= req.cookies.token || req.headers.authorization?.split(' ')[1];
    if(!token){
      return res.redirect("/indusrtyLogin");
    }
    const decode= jwt.verify(token,"JWT_SECRET");
    if(!decode){
      return res.redirect("/indusrtyLogin");
    }
    req.industry= decode.industry_id;
    next();

  }
  catch(error){
    console.log(error)
    return res.redirect("/indusrtyLogin");
  }
}
   

export{industryAuth};
