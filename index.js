require("dotenv").config()

const express = require("express")
const app = express();
const path = require('path')
const mongoose = require("mongoose");
const bodyParser = require("body-parser")
const mongoSanitize = require('express-mongo-sanitize');
const MongoStore = require('connect-mongo');

const User = require("./models/User")
const {authRoutes,productsRoutes} = require("./Routes");
const {requireToken,isPhoneNoVerified} = require("./middlewares")

const dbUrl = process.env.DB_URL;
mongoose.connect(dbUrl,
    { 
    useNewUrlParser: true, 
    useUnifiedTopology: true, 
    useCreateIndex: true, 
    useFindAndModify: false});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    console.log("MONGOOSE CONNECTED")
});

app.use(express.json())
app.use(mongoSanitize({
   replaceWith: ' '
 }));

app.use("/api/auth",authRoutes)
app.use("/api/products",productsRoutes)

app.get('/',requireToken,isPhoneNoVerified(true),async(req,res)=>{
    res.send(req.user)
})


const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`serving on port ${port}`);
})