const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../models/user');
const {getPasswordError, toSignupErrorResponse} = require('../utils/validation');

const authRouter = express.Router();

// Shared by signup and login so both sessions behave the same.
const setAuthCookie = (res, user) => {
    const token = user.getJWT();
    res.cookie("token", token, {maxAge: 60 * 1000});
};

authRouter.post('/signup', async (req, res) => {
    // The password rules must run on the raw password, before it is hashed.
    const passwordError = getPasswordError(req.body.password);
    if (passwordError) {
        return res.status(400).send({message: passwordError, errors: {password: passwordError}});
    }

    try {
        const passwordHash = await bcrypt.hash(req.body.password, 10);

        // creating a new instance of user model
        const user = new User({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            password: passwordHash,
            age: req.body.age,
            gender: req.body.gender
        });
        await user.save();
        // Log the new user in right away.
        setAuthCookie(res, user);
        res.send({message: 'User signed up successfully ...', user});
    }catch(err){
        const {status, body} = toSignupErrorResponse(err);
        res.status(status).send(body);
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
        setAuthCookie(res, user);
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