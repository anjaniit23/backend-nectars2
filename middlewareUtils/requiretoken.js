const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require("../models/User")
const jwtkey = process.env.JWT_KEY

module.exports = (req,res,next)=>{
       const { authorization } = req.headers;
       if(!authorization){
          return res.status(401).send({error:"Token is required"})
       }
       const token = authorization.replace("Bearer ","");
       jwt.verify(token,jwtkey,async (err,payload)=>{
           if(err){
             return  res.status(401).send({error:"Invalid Token"})
           }
        const {userId} = payload;
        const user = await User.findById(userId)
        if(!user){
         return  res.status(401).send({error:"Invalid token"})
       }
        req.user=user;
        next();
       })
}