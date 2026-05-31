const userAuth = (req, res, next) => {
    console.log('Authorizing user ...');
    const token = "12345";
    const userAuthenticated = token === "12345";
    if(!userAuthenticated) {
        res.status(401).send({message: 'Unauthorized'});
    }
    next();
}

module.exports = userAuth;