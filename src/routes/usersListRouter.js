const express = require('express');
const ConnectionRequest = require('../models/connectionRequest');
const User = require('../models/user');
const userAuth = require('../middlewares/userAuth');

const usersListRouter = express.Router();

usersListRouter.get('/feed', userAuth,async(req, res) => {
    const loggedInUser = req.user;

    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 5, 12);
    const skip = (page - 1)*limit;

    try{
        const connections = await ConnectionRequest.find({"$or":[{fromUserId: loggedInUser._id}, {toUserId: loggedInUser._id}]}).select('fromUserId toUserId');
         
        const hideUsersFromFeed = new Set();
        connections.forEach(connection => {
            hideUsersFromFeed.add(connection.fromUserId.toString());
            hideUsersFromFeed.add(connection.toUserId.toString());
        })

        console.log('hideUsersFromFeed', hideUsersFromFeed);

        const feed = await User.find({_id: {$nin: Array.from(hideUsersFromFeed)}})
                               .select('firstName lastName avtar bio skills')
                               .skip(skip)
                               .limit(limit);

        res.send({message: 'Feed fetched successfully ...', feed});
    }catch(error){
        res.status(500).send({message: 'Error fetching feed ...', error: error.message});
    }

   

})

//fetch the list of all the requests loggedin users has 
// received(received -> connectionRequest status is interested)
usersListRouter.get('/requests/received',userAuth, async(req, res) => {
    
    const loggedInUser = req.user
    try{
        const requests = await ConnectionRequest.find({toUserId: loggedInUser._id, status: 'interested'}).populate('fromUserId', ["firstName", "lastName", "avtar"]);
        res.send({message: 'Connection requests fetched successfully ...', requests});
    }catch(error){
        res.status(500).send({message: 'Error fetching connection requests ...', error: error.message});
    }
 
})

//fetch the list of the users who accepted the request of loggedIn user or loggedIn user accepted the requests
usersListRouter.get('/connections', userAuth, async(req, res) => {
 const loggedInUser = req.user;
 try{
    let connections = await ConnectionRequest.find({$or: [{fromUserId: loggedInUser._id, status:'accepted'}, {toUserId: loggedInUser._id, status: 'accepted'}]}).populate('fromUserId', ["firstName", "lastName", "avtar"]).populate('toUserId', ["firstName", "lastName", "avtar"]);
    connections = connections.map((connection) => {
        if(connection.fromUserId._id.equals(loggedInUser._id)){
            return connection.toUserId;
        }else{
            return connection.fromUserId;
        }
    });
    res.send({message: 'Connections fetched successfully ...', connections});
}catch(error){
    res.status(500).send({message: 'Error fetching connections ...', error: error.message});
 }
})

module.exports = usersListRouter;