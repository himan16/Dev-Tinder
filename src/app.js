const express = require('express');
const bcrypt = require('bcrypt');
const userAuth = require('./middlewares/userAuth');
const connectToDatabase = require('./configs/database');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const User = require('./models/user');

const app = express();

app.use(express.json(), cookieParser());

app.post('/signup', async (req, res) => {
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
})

app.post('/login', async (req, res) => {
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

app.get('/profile', userAuth, async (req, res) => {
    const user = req.user;
    res.send(user);
});

app.get('/feed', async(req, res) => {
    try {
       const users = await User.find({});
       res.send({message: 'Users fetched successfully ...', users}); 
    }catch(reason){
        res.status(500).send({message: 'Error fetching users ...', error: reason.message});
    }
})

app.put('/user/:userId', async (req, res) => {
    const userId = req.params?.userId;
    const dataToUpdate = req.body;

    const allowedFields = ['firstName', 'lastName', 'password', 'age', 'gender', 'avtar', 'bio', 'skills'];

    try{
        if(Object.keys(dataToUpdate).some(key => !allowedFields.includes(key))){
            throw new Error('Invalid fields in update request ...');
        }
        const data = await User.findByIdAndUpdate(userId, dataToUpdate, {new: true});
        res.send({message: 'User updated successfully ...', updatedUser: data});
    }catch(reason){
        res.status(500).send({message: 'Error updating user ...', error: reason});
    }
})

app.delete('/user', async (req, res) => {
    const userId = req.body.userId;

    try{
        await User.findByIdAndDelete(userId);
        res.send({message: 'User deleted successfully ...'});
    }catch(err){
        res.status(500).send({message: 'Error deleting user ...', error: err});
    }
})

connectToDatabase().then((result) => {
    console.log('Connected to database successfully ...');
    app.listen(7777, () => {
        console.log('Server is listening on port 7777 ...');
    });
}).catch((err) => {
    console.log('Error connecting to database ...', err);
});