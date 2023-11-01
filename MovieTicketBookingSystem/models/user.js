const mongoose = require('mongoose')

const Schema = mongoose.Schema;

// Schema for user model

const userSchema = new Schema({
    Id:{
        type: String,
        required: true
    },
    firstName:{
        type: String,
        required: true
    },
    lastName:{
        type: String
    },
    email:{
        type: String,
        required: true
    },
    password:{
        type: String,
        required: true
    },
    phone:{
        type: Number,
        required: true
    },
    dob:{
        type: String
    },
    active:{
        type: Boolean,
        required: true
    },
    profileImage:{
        type: String
    }
})

module.exports = mongoose.model('User', userSchema)