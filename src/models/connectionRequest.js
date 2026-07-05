const { mongoose } = require('mongoose');

const connectionRequestSchema = new mongoose.Schema({
    fromUserId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    toUserId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    status: {
        type: String,
        enum: {
            values: ['interested', 'ignored', 'accepted', 'rejected'],
            message: '{VALUE} is not a valid status.'
        },
        required: true
    }
}, {
    timestamps: true
});

connectionRequestSchema.index({fromUserId: 1, toUserId: 1});

connectionRequestSchema.pre('save', function(){
    const connectionData = this;
    if(connectionData.fromUserId.equals(connectionData.toUserId)){
        throw new Error('A user cannot send a connection request to themselves.');
    }
})



const ConnectionRequest = mongoose.model('ConnectionRequest', connectionRequestSchema);

module.exports = ConnectionRequest;