const express = require('express');
const userAuth = require('../middlewares/userAuth');
const ConnectionRequest = require('../models/connectionRequest');
const User = require('../models/user');

const connectionRequestRouter = express.Router();

connectionRequestRouter.post('/request/send/:status/:toUserId', userAuth, async (req, res) => {
    
    const fromUserId = req.user._id;
    const {status, toUserId} = req.params;
    
    const allowedStatuses = ['interested', 'ignored'];
    if(!allowedStatuses.includes(status)){
        return res.status(400).send({message: 'Invalid status. Allowed values are interested and ignored.'});
    }

    const existingConnection = await ConnectionRequest.findOne({"$or": [{fromUserId, toUserId}, {fromUserId: toUserId, toUserId: fromUserId}]});
    if(existingConnection){
        return res.status(400).send({message: 'Connection request already exists between these users.'});
    }

    const toUser = await User.findById(toUserId);
    if(!toUser){
        return res.status(404).send({message: 'The user you are trying to connect with does not exist.'});
    }

    try{
        const connection = new ConnectionRequest({
            fromUserId,
            toUserId,
            status
        })
        await connection.save();
        res.send({message: 'Connection request sent successfully ...', connection});
    }catch(error){
        res.status(500).send({message: error.message});
    }
});

connectionRequestRouter.post('/request/review/:status/:connectionRequestId', userAuth, async (req, res) => {
    /**
     * Needs to check things
     * 
     * 1. status must be either accepted or rejected
     * 2. connection request must have current status as interested.
     * 3. And toUserId of the connection request must be the current logged in user
     * 
     */
    const loggedInUser = req.user;
    const {status, connectionRequestId} = req.params;
    const allowedStatuses = ['accepted', 'rejected'];
    if(!allowedStatuses.includes(status)){
        return res.status(400).send({message: 'Invalid status. Allowed values are accepted and rejected.'});
    }

    try {
        const connectionRequest = await ConnectionRequest.findOne({_id: connectionRequestId, toUserId: loggedInUser._id, status: 'interested'});
        if(!connectionRequest){
            return res.status(404).send({message: 'Connection request not found or already reviewed.'});
        }
        connectionRequest.status = status;
        const updatedConnection = await connectionRequest.save();
        res.send({message: 'Connection request reviewed successfully ...', updatedConnection});
    }catch(error){
        res.status(500).send({message: error.message});
    }

})

module.exports = connectionRequestRouter;