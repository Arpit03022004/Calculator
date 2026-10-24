const express = require("express");
const router = express.Router() ;
const { add , sub , multiply , division} = require('../calculator');
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const CalcHistory = require("../models/CalcHistory");

const secretkey = process.env.JWT_SECRET ;
const bcrypt = require("bcrypt");
const mongoose = require('mongoose');
const ratelimit = require("express-rate-limit");


const rateLimiter = ratelimit({
    windowMs : 15*60*1000,
    max : 500,
    message: { 
        error: "Too many calculation requests from this IP, please try again after 15 minutes." 
    },
    standardHeaders: true
})



function requirelogin(req, res , next) {
    const authHeader = req.headers.authorization ;
    if(!authHeader || !authHeader.startsWith("Bearer")){
      return  res.status(400).json({error : "NO token sign in again"});
    }

     const token = authHeader.split(' ')[1];

    try{
        const decodedpayload = jwt.verify(token , secretkey);
        req.user = decodedpayload.username ;
        next() ;
    } 
    catch (error) {
            res.status(400).json({ error : " cant verify user"});
    }

}

router.get('/calculate/:operation'  , (req, res)=> {
    const x = Number(req.query.a);
    const y = Number(req.query.b);
    const opn = req.params.operation ;

     if(isNaN(x)||isNaN(y)){
        return res.status(400).json({
            error : " bad request"
        })
    }

    if(opn == 'add'){
        const c = add(x , y);
        res.send(String(c));
    }
    else if(opn == 'subtract'){
        const c = sub(x , y);
        res.send(String(c));
    }
    else if(opn == 'multiply'){
        const c = multiply(x , y);
        res.send(String(c));
    }
   else if(opn == 'division'){
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
    }
    else{
        res.status(400).send("Send correct operation");
    }


})

router.post('/math' , requirelogin , rateLimiter ,async (req , res)=>{
     const x = Number(req.body.a);
    const y = Number(req.body.b);
    const opn = req.body.operation ;

     if(isNaN(x)||isNaN(y)){
        return res.status(400).json({
            error : " bad request"
        })
    }

    let result ;

    if(opn == 'add'){
        result = add(x , y);
    }
    else if(opn == 'subtract'){
        result = sub(x , y);
    }
    else if(opn == 'multiply'){
       result = multiply(x , y);
       
    }
   else if(opn == 'division'){
       try{
         result = division(x , y);
        
       }
   catch(error){
   return res.status(400).json({ error: error.message });
   }
}

try {
    const historyrecord = new CalcHistory ( {
        username : req.user,
        num1 : x ,
        num2 : y ,
        operation : opn,
        result : result

    });

    await historyrecord.save() ;
    return res.status(200).json({
        message : " Result finally saved to json" ,
        result : result
    })

} catch(error){
    console.error(error);
    return res.status(500).json({ error: "Failed to save history" });
}

})

router.delete('/history' , requirelogin , async (req, res)=> {
    try{
        await CalcHistory.deleteMany({username : req.user});
        res.status(200).json({
            message : " history deleted"
        })
    } catch(error){
        res.status(400).json({
            message : "Error occurred"
        })
    }
});




router.post('/register', async (req, res) => {
    console.log("Incoming data:", req.body);
 
    try {
        const { username, password } = req.body;
if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required!" });
}

        

        const existinguser = await User.findOne({username}) ;

        if(existinguser){
            return res.status(400).json({error : "already exist"});
        }

        const saltRounds = 10 ;
        const salt = await bcrypt.genSalt(saltRounds) ;

        const hashedpassword = await bcrypt.hash(password , salt);

         const newUser = new User({
            username: username,
            password: hashedpassword
        });



        // 2. Save them to the database
        await newUser.save();

        res.status(201).json({ message: "User registered successfully!" });

    } catch (error) {

        console.log("THE EXACT DB ERROR:", error.message);
        // If the username already exists, MongoDB throws a duplicate key error (code 11000)
        if (error.code === 11000) {
            return res.status(400).json({ error: "Username already taken." });
        }
        res.status(500).json({ error: "Something went wrong." });
    }
});


router.post('/login' , async (req, res)=>{
    try{
        const { username , password} = req.body ;
        const finduser = await User.findOne({username : username}) ;

        if (!finduser) {
            return res.status(401).json({ message: "User does not exist" }); 
        }

       const isMatched = await bcrypt.compare(password , finduser.password);

        if(isMatched){

            const token = jwt.sign({username : username} , secretkey , {expiresIn :"2h"}) ;



            res.status(200).json({ 
                message: "Successfully authenticated",
                token: token
            }); 
        } 
        else {
            res.status(401).json({ message: "Verification failed" });
        }

    }
    catch(error){
        res.status(500).json({error : " Something went wrong"}) ;
    }
 
})

router.get('/history' , requirelogin ,async (req,res)=>{
    try{
        const history = await CalcHistory.find({username: req.user}).sort({timestamp  : -1}).limit(50);
        res.status(200).json({history});
    } catch (error) {
        res.status(500).json({ error: "Could not retrieve history" });
    }
})






module.exports = router ;