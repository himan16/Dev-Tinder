const express = require('express');
const connectToDatabase = require('./configs/database');
const cookieParser = require('cookie-parser');
const authRouter = require('./routes/authRouter');
const profileRouter = require('./routes/profileRouter');
const usersListRouter = require('./routes/usersListRouter');
const connectionRequestRouter = require('./routes/connectionRequestRouter');

const app = express();

//express.json() is a built in middleware function in express. It parses incoming requests with JSON payloads and is based on body-parser.
//cookieParser() is a middleware which parses cookies attached to the client request object. It populates the req.cookies object with the cookies sent by the client.
app.use(express.json(), cookieParser());

app.use('/', authRouter, profileRouter, usersListRouter, connectionRequestRouter);

connectToDatabase().then((result) => {
    console.log('Connected to database successfully ...');
    app.listen(7777, () => {
        console.log('Server is listening on port 7777 ...');
    });
}).catch((err) => {
    console.log('Error connecting to database ...', err);
});