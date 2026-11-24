const express = require('express');
const connectToDatabase = require('./configs/database');
const cookieParser = require('cookie-parser');
const authRouter = require('./routes/authRouter');
const profileRouter = require('./routes/profileRouter');
const usersListRouter = require('./routes/usersListRouter');
const connectionRequestRouter = require('./routes/connectionRequestRouter');

const app = express();

//Exact origins (scheme + host + port) that may call this API. Add new frontends here.
const ALLOWED_ORIGINS = new Set([
    'http://localhost:5173',
    'http://15.134.202.131',
]);

//Manual CORS middleware. Must be registered before the routes. It only allows the origins listed above to call this API.
//Access-Control-Allow-Credentials lets the browser send/receive cookies (needed for the JWT cookie), and requires an explicit origin (not '*').
app.use((req, res, next) => {
    const origin = req.headers.origin;
    const isAllowedOrigin = ALLOWED_ORIGINS.has(origin);

    if (isAllowedOrigin) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Access-Control-Allow-Credentials', 'true');
        res.setHeader('Vary', 'Origin');
    }

    //Preflight request: the browser sends OPTIONS first (JSON bodies, PATCH/DELETE etc.). Answer it here and skip the routers.
    if (req.method === 'OPTIONS') {
        if (isAllowedOrigin) {
            res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        }
        return res.sendStatus(204);
    }

    next();
});

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