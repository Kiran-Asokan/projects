const mongoose = require('mongoose')

const Schema = mongoose.Schema;

// Schema for movie model

const movieSchema = new Schema({
    Id:{
        type: String,
        required: true
    },
    name:{
        type: String,
        required: true
    },
    language:{
        type: String,
        required: true
    },
    duration:{
        type: String,
        required: true
    },
    genre:{
        type: String,
        required: true
    },
    description:{
        type: String,
        required: true
    },
    active:{
        type: Boolean,
        required: true
    },
    posters:[{
        type: String
    }],
    reviews:[
        {
            user:{
                type: Schema.Types.ObjectId,
                ref:'User'
            },
            review:{
                type: String
            }
        }
    ]
})

module.exports = mongoose.model('Movie', movieSchema)