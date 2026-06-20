const jwt = require('jsonwebtoken');
const User = require('../models/user');

const userAuth = async (req, res, next) => {
    console.log('Authorizing user ...');
    try{
        const {token} = req.cookies;
        if(!token){
            res.status(401).send({message: 'Unauthorized token not found'});
            return;
        }
        const { userId } = jwt.verify(token, 'randomSecretKey');
        
        const user = await User.findById(userId)
        if(!user){
            res.status(401).send({message: 'Unauthorized User not found'});
        }
        req.user = user;
    }catch(err){
        res.status(401).send({message: 'Unauthorized', error: err.message});
    }finally{
        next();
    }

}

module.exports = userAuth;