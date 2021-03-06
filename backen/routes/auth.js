const express = require('express');
const router = express.Router();
const User = require('../models/User');
const {body, validationResult} = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fetchuser = require('../middleware/fetchuser');
const JWT_SECRET = "HARHARMAHAEV"


// route 1 --- create user POST : api/auth/createuser no login require
router.post('/createuser',[
    body('name','Enter a vali name').isLength({min:3}),
    body('email','Enter a vali email').isEmail(),
    body('password','Pass must be atleast 5 char long').isLength({min:5}),
], async (req, res)=>{
    let success = false;
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({success, errors : errors.array()});
    }
    try{
        let user = await User.findOne({email : req.body.email});
        console.log(user);
        if(user){
            return res.status(400).json({success, error: "this user alrea exist"})
        }
        const salt = await bcrypt.genSalt(10);
        secPass = await bcrypt.hash(req.body.password, salt);
        user = await User.create({
            name: req.body.name,
            email: req.body.email,
            password: secPass,
        })
        const data = {
            user:{
                id: user.id
            }
        }
        const authtoken = jwt.sign(data,JWT_SECRET);
        
        success = true;
        res.json({success, authtoken});
    }catch(error){
        console.error(error.message);
        res.status(500).send("internal server error");
    } 

    
}) 

//route 2 --- authenticate user POST : api/auth/login login require
router.post('/login',[
    body('email','Enter a vali email').isEmail(),
    body('password','Pass cannot be blank').exists(),
], async (req, res)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors : errors.array()});
    }

    const {email, password} = req.body;
    try{ 
        let user = await User.findOne({email});
        if(!user){
            success = false;
            return res.status(400).json({success, error: "please login with correct creentials"});
        }
        const passwordCompare = await bcrypt.compare(password, user.password);
        if(!passwordCompare){
            success = false;
            return res.status(400).json({success, error: "please login with correct creentials"});
        }

        const data = {
            user:{
                id: user.id
            }
        }
        const authtoken = jwt.sign(data,JWT_SECRET);
        success = true;
        res.json({success, authtoken});


    }catch(error) {
        console.error(error.message);
        res.status(500).send("internal server error");
    }
})

//route 3 --- get log in user details POST : api/auth/getuser login require
router.post('/getuser',fetchuser, async (req, res)=>{
try {
    userId = req.user.id;
    const user = await User.findById(userId).select("-password")
    res.send(user);
} catch (error) {
    console.error(error.message);
    res.status(500).send("internal server error");
}
})
module.exports = router

