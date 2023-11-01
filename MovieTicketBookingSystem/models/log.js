const mongoose = require('mongoose')

const Schema = mongoose.Schema;

// Schema for log model

const logSchema = new Schema({
    bookingId:{
        type: String,
        required: true
    },
    tickets:{
        type: Number,
        required: true
    },
    user:{
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    theater:{
        type: Schema.Types.ObjectId,
        ref: 'Theater',
        required: true
    },
    movie:{
        type: Schema.Types.ObjectId,
        ref: 'Movie',
        required: true
    },
    showtime:{
        type: String,
        required: true
    },
    totalPrice:{
        type: Number,
        required: true
    },
    status:{
        type: String,
        required: true
    },
    date:{
        type: Date,
        required: true
    }
})

module.exports = mongoose.model('Log', logSchema)