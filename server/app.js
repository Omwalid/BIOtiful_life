global.__basedir = __dirname;
require('dotenv').config()
const express = require ('express')
const path = require('path');
const app = express()

const cookieParser= require('cookie-parser');
const session = require("express-session");
const bodyParser= require('body-parser');
var cors = require('cors');


var userRoute = require('./routes/users')
var storeRoute = require('./routes/store')
var orderRoute = require('./routes/orders')


app.use(bodyParser.json());
app.use(cookieParser());
app.use(cors({
    credentials: true,
    origin: ["http://localhost:3000","http://192.168.1.7:3000"]
  }));


app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: false 
}));

app.use('/users', userRoute);
app.use('/store', storeRoute);
app.use('/orders', orderRoute);
app.use('/productImage', express.static(path.join(__dirname, '/uploads')));

const PORT = process.env.PORT || 5000

app.listen(PORT,()=>{
    console.log(`server listen to port ${PORT}`);
})