const {mongoose} = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 50,
        trim: true
    },
    lastName: {
        type: String,
        minlength: 3,
        maxlength: 50,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error('Invalid email address ...'+value);
            }
        }
    },
    password: {
        type: String,
        required: true
    },
    age: {
        type: Number,
        required: true,
        min: 18,
    },  
    gender: {
        type: String,
        required: true,
        validate(value){
            if(!["male", "female", "other"].includes(value)){
                throw new Error('Gender must be either male, female or other ...');
            }
        }
    },
    avtar: {
        type: String,
        default: 'https://cdn-icons-png.flaticon.com/512/149/149071.png'
    },
    bio: {
        type: String,
        default: 'Hey there, I am using DevTinder ...'
    },
    skills: {
        type: [String]
    }
},    
{
    timestamps: true
})

userSchema.methods.getJWT = function(){
    const user = this;
    const token =  jwt.sign({userId: user._id}, 'randomSecretKey', {expiresIn: '7d'});
    return token;
}

userSchema.methods.validatePassword = async function(inputPassword){
    const user = this;
    const isPasswordCorrect = await bcrypt.compare(inputPassword, user.password);
    return isPasswordCorrect;
}

const User = mongoose.model('User', userSchema);

module.exports = User; 