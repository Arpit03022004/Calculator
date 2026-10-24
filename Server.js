const express  = require('express');
const app = express();
const route = require('./routes/routes');
const path = require('path');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('./models/User');
const CalcHistory = require('./models/CalcHistory');
require("dotenv").config();
const secretkey = process.env.JWT_SECRET ;




app.use(express.json());


console.log("MONGO_URI loaded:", !!process.env.MONGO_URI);

// we use below code to make our paths bulletproof after we encuntered some sort ofbug
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'Index.html'));
});
// SERVERLESS DATABASE CONNECTION
const connectDB = async () => {
    // If already connected, skip reconnecting to save time
    if (mongoose.connection.readyState >= 1) return;
    
    // Connect using your Vercel environment variable
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected Successfully");
};

// Force the DB to connect BEFORE processing any routes
app.use(async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (error) {
        console.log("DB Connection Error:", error.message);
        // Instantly rejects the request if the DB fails, preventing 10s timeouts
        return res.status(500).json({ error: "Database connection failed. Check Vercel MONGO_URI." });
    }
});


app.listen(3000 , ()=> {
    console.log("Server is running on port 3000");
})
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
app.use((req , res , next)=>{
    console.log(`${req.method} request made to: ${req.url}`);
    next();
   })

app.use('/' , route) ;


   module.exports = app ;

/*

Below was the old static route method
app.get('/' , (req , res)=>{
    res.send("welcome to calculator");
})

app.get('/add' , (req , res)=> {
    const x = Number(req.query.a) ;
    const y = Number(req.query.b) ;
    const c = x +  y ;
    res.send(String(c)) ;
})

app.get('/subtract' , (req , res)=> {
    const x = Number(req.query.a) ;
    const y = Number(req.query.b) ;
    const c = x - y ;
    res.send(String(c)) ;
})

app.get('/multiply' , (req , res)=> {
    const x = Number(req.query.a) ;
    const y = Number(req.query.b) ;
    const c = x * y ;
    res.send(String(c)) ;
})

app.get('/division' , (req , res)=> {

    const x = Number(req.query.a) ;
    const y = Number(req.query.b) ;

    if(isNaN(x)||isNaN(y)){
        return res.status(400).json({
            error : " bad request"
        })
    }
    if(y==0){
        res.status(400).send("Number can not be divided by 0");
    }
    else{
    const c = Math.floor(x / y) ;
    const d = x % y ;
    res.json({
        quotient : c ,
        remainder : d
    }) ;
    }
})
    */

