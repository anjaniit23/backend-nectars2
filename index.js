require("dotenv").config()

const express = require("express")
const app = express();
const path = require('path')
const mongoose = require("mongoose");
const bodyParser = require("body-parser")
const mongoSanitize = require('express-mongo-sanitize');
const MongoStore = require('connect-mongo');

const User = require("./models/User")
const authRoutes = require("./Routes/auth");
const requireToken = require("./middlewareUtils/requiretoken")
const isPhoneNoVerified = require("./middlewareUtils/isPhoneNoVerified")

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

app.use(bodyParser.json())
app.use(mongoSanitize({
   replaceWith: ' '
 }));

app.use("/api/auth",authRoutes)

app.get('/',requireToken,isPhoneNoVerified,async(req,res)=>{
    res.send(req.user)
})


const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`serving on port ${port}`);
})