const mongoose = require('mongoose');
const User = require("../models/User")

module.exports = function(bool){
    return (req, res, next) => {
        if(req.user.isPhoneNoVerified !== bool){
            return res.status(401).send({error:`Phone no is ${bool? "not verified" : "already verified"}`})
        }
        next();
    }
}
