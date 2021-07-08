require("dotenv").config()

const express = require('express')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const jwtkey = process.env.JWT_KEY
const router = express.Router();
const User = require("../models/User")

const client = require('twilio')(process.env.A_SID, process.env.AUTH_TOKEN)

const getUser = async(req,res) => {
  const { authorization } = req.headers;
  if (!authorization) {
    return res.status(422).send({ error: "Invalid Token" })
  }
  const token = authorization.replace("Bearer ", "");
  const { userId } = jwt.verify(token, jwtkey);
  const user = await User.findById(userId)
  if (!user) {
    return res.status(422).send({ error: "Invalid Token" })
  }
  return user;
}


router.post('/register', async (req, res) => {
    const { email, password, name, role = "Customer", phoneNo } = req.body;
    if (!email || !password) {
      return res.status(422).send({ error: "Must provide email or password" })
    }
    const user = await User.findOne({ email })
    if (user && !user.isPhoneNoVerified) {
      return res.status(422).send({ error: "Already registered! Please login and verify your phone no" })
    } else if (user) {
      return res.status(422).send({ error: "Already registered! Please login" })

    }

    try {
      const user = new User({ email, password, name, role, phoneNo });
      await user.save();
      const token = jwt.sign({ userId: user._id }, jwtkey)
      res.send({ token })

    } catch (err) {
      return res.status(422).send(err.message)
    }
  })

router.post('/login', async (req, res) => {
    const { email, password } = req.body
    if (!email || !password) {
      return res.status(422).send({ error: "Must provide email or password" })
    }
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(422).send({ error: "Please register yourself first" })
    }
    try {
      await user.comparePassword(password);
      const token = jwt.sign({ userId: user._id }, jwtkey)
      res.send({ token })
    } catch (err) {
      return res.status(422).send({ error: "Something went worng, plese try again" })
    }
  })

router.route('/verifyPhoneNo')
      .get(async (req, res) => {
        const user = await getUser(req,res)
        if(user.isPhoneNoVerified){
          return res.status(422).send({ error: "Phone no is already verified" })
        }

        client
          .verify
          .services(process.env.SID)
          .verifications
          .create({
            to: `+91${user.phoneNo}`,
            channel: 'sms'
          })
          .then(data => {
            res.send({ success: `OTP sent successfully!` });
          },reason =>{
            res.status(501).send({ error: reason });
          })
      
      })
      .post(async (req, res) => {
        const user = await getUser(req,res)
        if(user.isPhoneNoVerified){
          return res.status(422).send({ error: "Phone no is already verified" })
        }
        if (!user) {
          return res.status(422).send({ error: "User isn't logged in for phone no verification" })
        }else if(!req.body.code){
          return res.status(422).send({ error: "Please pass a OTP code" })
        }
        if ((req.body.code).length === 6) {
          try {
            client
              .verify
              .services(process.env.SID)
              .verificationChecks
              .create({
                to: `+91${user.phoneNo}`,
                code: req.body.code
              })
              .then(async (data) => {
                if (data.status === "approved") {
                  const newUser = await User.findById(user._id)
                  newUser.isPhoneNoVerified = true
                  await newUser.save()
                  res.send({ success: "OTP approved" })
                }
                else {
                  res.send({ success: "OTP is incorrect" })
                }
              })
          } catch (e) {
            res.status(504).send({ error: "Generate OTP again" })
          }

        } else {
          res.status(401).send({ error: "OTP is incorect" })
        }
      })

module.exports = router