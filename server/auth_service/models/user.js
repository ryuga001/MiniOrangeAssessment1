import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    phoneno: {
        type: String,
        
    },
    refreshToken : {
        type : String,
        default : null
    },
    googleId : {
        type :String,
        default : null
    }
}, {
    timestamps: true
});

const User = mongoose.model('User', userSchema);

export default User;