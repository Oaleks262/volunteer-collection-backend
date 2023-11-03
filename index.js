import express from "express";
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import mongoose from "mongoose";
import {registerValidator} from "./validation/auth.js"
import {validationResult} from "express-validator"
import UserModel from "./models/User.js"





mongoose.connect('mongodb+srv://Admin:qwer1234@cluster0.lyfarnn.mongodb.net/baza?retryWrites=true&w=majority')
.then(()=>{console.log('DB ok')})
.catch((err)=> {console.log('DB error', err)});

const app = express();
app.use(express.json());


app.post('/auth/register' , registerValidator, async (req, res)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json(errors.array());
    }
    const password = req.body.password;
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);


    const doc = new UserModel({
        email: req.body.email,
        passwordHash,
    })

    const user = await doc.save();
    res.json(user);
})

app.listen(4444, (err) => {
    if (err){
        return console.log(err);
    }
    else{
        console.log('Server OK');
    }
});