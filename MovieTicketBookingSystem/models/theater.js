const mongoose = require('mongoose')

const Schema = mongoose.Schema;

// Schema for theater model

const theaterSchema = new Schema({
    Id:{
        type: String,
        required: true
    },
    name:{
        type: String,
        required: true
    },
    location:{
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true
    },
    phone:{
        type: Number
    },
    password:{
        type: String,
        required: true
    },
    expiration:{
        type: String,
        required: true
    },
    active:{
        type: Boolean,
        required: true
    },
    images:[{
        type: String
    }
    ],
    shows:[
        {
            movie:{
                type: Schema.Types.ObjectId,
                ref:'Movie'
            },
            showtime:{
                type: String
            },
            price:{
                type: Number
            },
            availableSeats:{
                type: Number
            }
            
        }
    ]
})

module.exports = mongoose.model('Theater', theaterSchema)