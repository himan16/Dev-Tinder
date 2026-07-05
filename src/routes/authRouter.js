const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../models/user');

const authRouter = express.Router();

authRouter.post('/signup', async (req, res) => {
    // creating a new instance of user model    
    try {
        const passwordHash = await bcrypt.hash(req.body.password, 10);
        
        const user = new User({
            firstName: req.body.firstName, 
            lastName: req.body.lastName,
            email: req.body.email,
            password: passwordHash,
            age: req.body.age,
            gender: req.body.gender
        });
        await user.save()
        res.send({message: 'User signed up successfully ...', user});
    }catch(err){
        res.status(500).send({message: 'Error signing up user ...', error: err}); 
    }
});

authRouter.post('/login', async (req, res) => {
    const {email: inputEmail, password: inputPassword} = req.body;
    try{
        const user = await User.findOne({email: inputEmail});
        if(!user){
            res.status(404).send({message: 'Incorrect credentials ...'});
            return;
        }
        const isPasswordCorrect = await user.validatePassword(inputPassword);
        if(!isPasswordCorrect){
            res.status(404).send({message: 'Incorrect credentials ...'});
            return;
        }
        const token = user.getJWT();
        res.cookie("token", token, {maxAge: 7 * 24 * 60 * 60 * 1000});
        res.send({message: 'User logged in successfully ...', user});
    }catch(reason){
        res.status(500).send({message: 'Error logging in user ...', error: reason.message});
    }
})

authRouter.post('/logout', async (req, res) => {
    res.clearCookie('token');
    res.send({message: 'User logged out successfully ...'});
})

module.exports = authRouter;