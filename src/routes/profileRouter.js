const express = require('express');
const bcrypt = require('bcrypt');
const profileRouter = express.Router();
const userAuth = require('../middlewares/userAuth');
const User = require('../models/user');

profileRouter.get('/profile/view', userAuth, async (req, res) => {
    const user = req.user;
    res.send(user);
});

profileRouter.put('/profile/edit', userAuth, async (req, res) => {
    const userId = req.user._id;
    const dataToUpdate = req.body;
    const allowedFields = ['firstName', 'lastName', 'age', 'gender', 'avtar', 'bio', 'skills'];

    try{
        if(Object.keys(dataToUpdate).some(key => !allowedFields.includes(key))){
            res.status(400).send({message: 'Invalid fields in update request ...'});
            return;
        }
        const data = await User.findByIdAndUpdate(userId, dataToUpdate, {new: true});
        res.send({message: 'User updated successfully ...', updatedUser: data});
    }catch(reason){
        res.status(500).send({message: 'Error updating user ...', error: reason});
    }
})

profileRouter.post('/profile/changePassword', userAuth, async (req, res) => {
    const {inputCurrentPassword, inputNewPassword} = req.body;
    const user = req.user;
    try {
        const isCurrentPasswordCorrect = await user.validatePassword(inputCurrentPassword);
        if(!isCurrentPasswordCorrect){
            res.status(400).send({message: 'Current password is incorrect ...'});
            return;
        }
        const newPasswordHash = await bcrypt.hash(inputNewPassword, 10);
        user.password = newPasswordHash;
        await user.save();
        res.send({message: 'Password changed successfully ...'});
    }catch(reason){
        res.status(500).send({message: 'Error changing password ...', error: reason.message});
    }
});

module.exports = profileRouter;