const mongoose = require('mongoose')

const Schema = mongoose.Schema;

// Schema for admin model

const adminSchema = new Schema({
    Id:{
        type: String,
        required: true
    },
    firstname:{
        type: String,
        required: true
    },
    lastname:{
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
    profileImage:{
        type: String
    }
})

module.exports = mongoose.model('Admin', adminSchema)