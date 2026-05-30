const express = require('express');

const app = express();

app.get('/', (req, res) => {
    res.send('root root');
})

app.use('/home', (req, res) => {
    res.send('home home');
})

app.use((req, res) => {
    // this callback is called request handler.

    res.send('Yes we can Himanshu. Yes we can. Yes we can. Yes I can do it. Yes I can do it. Yes I can do it Himanshu. With the blessing of Bihariji Baba and Jwala Mata I can do it.')
})

app.listen(7777, () => {
    console.log('Server is listening on port 7777 ...');
});