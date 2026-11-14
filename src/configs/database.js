const mongoose = require('mongoose');

async function connectToDatabase() {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
        throw new Error('MONGODB_URI is not set. Add it to your .env file.');
    }
    // Let errors propagate so the caller's .catch() runs and the server doesn't start without a DB.
    return mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
}

module.exports = connectToDatabase;
