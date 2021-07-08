const mongoose = require('mongoose');
const User = require("../models/User")

module.exports = (req, res, next) => {
    if(!req.user.isPhoneNoVerified){
        return res.status(401).send({error:"Phone no is not verified"})
    }
    next();
}
