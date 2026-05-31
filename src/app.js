const express = require('express');
const userAuth = require('./middlewares/userAuth');

const app = express();

// app.use('/user', userAuth)


app.get('/user', userAuth, (req, res, next) => {
    console.log('Sending response to user ...');
    res.send({name: 'John Doe', email: "aaad@gmail.com"});
})

app.post('/user', userAuth, (req, res) => {
    res.send({message: 'User created successfully'});
})

app.delete('/user', userAuth, (req, res) => {
    // this callback is called request handler.
    res.send({message: 'User deleted successfully'});
})

app.use('/', (err, req, res, next) => {
    if(err){
        res.status(500).send({message: 'Internal Server Error'});
    }
})

app.listen(7777, () => {
    console.log('Server is listening on port 7777 ...');
});