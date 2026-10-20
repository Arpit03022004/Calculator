const express  = require('express');
const app = express();
const route = require('./routes/routes');
const path = require('path');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('./models/User');
const CalcHistory = require('./models/CalcHistory');


const secretkey = process.env.JWT_SECRET ;




app.use(express.json());




// we use below code to make our paths bulletproof after we encuntered some sort ofbug
app.use(express.static(path.join(__dirname, 'public')));


mongoose.connect(process.env.MONGO_URI).then(()=> console.log("Successfully connected to db"))
.catch((err)=> console.log("Error is " , err)) ;


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

