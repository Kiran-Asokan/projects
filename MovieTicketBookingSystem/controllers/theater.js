const crypto = require('crypto');
const moment = require('moment')
const Theater = require('../models/theater');
const Movie = require('../models/movie');
const Token = require('../models/token')
const jwt = require('jsonwebtoken');



exports.updatePassword = (req, res, next) => {
    const password = req.body.password;
    const theaterId = req.session.theater.Id;

    // find theater from collection to change password
    Theater.find({Id: theaterId})
    .then(theaterData => {

        // encrypt password
        const key = Buffer.alloc(32, process.env.SECRET_KEY);
        const iv = Buffer.alloc(16, 0)
        const algorithm = process.env.ALGORITHM

        const cipher = crypto.createCipheriv(algorithm, key, iv);
        let encryptedPassword = cipher.update(password, 'utf-8', 'hex');
        encryptedPassword += cipher.final('hex');
        const theater = theaterData[0]
        theater.password = encryptedPassword
        // change validity of password to 1 year
        theater.expiration = moment().add(1, 'year').format()
        // save the theater details
        theater.save()
        .then(result => {
            return res.status(200).send({
                "status": 200,
                "Status":{
                    "message": " Password Updated"
                }
            })
        }).catch(err => {
            console.log(err);
            return res.status(400).send({
                "status": 400,
                "Error":{
                    "message": " Password Update failed"
                }
            })
        })

    }).catch(err => {
        console.log(err);
        return res.status(400).send({
            "status": 400,
            "Error":{
                "message": " database error"
            }
        })
    })


}

exports.addShows = (req, res, next) => {
    const theaterId = req.session.theater.Id;
    const movieId = req.body.movieId;
    const showtime = req.body.showtime;
    const price = req.body.price;
    const availableSeats = req.body.availableSeats;

    // find theater to add shows
    Theater.find({Id: theaterId})
    .then(theaterData => {
        const theater = theaterData[0];
        const showIndex = theater.shows.findIndex(element => element.showtime === showtime );
        // if the movie already exist add only the show time
        if(showIndex>=0){

            return res.status(400).send({
                "status": 400,
                "Error":{
                    "message": " Show already added"
                }
            }) 
            
        }
        Movie.find({Id: movieId})
        .then(movieData => {
            theater.shows.push({movie:movieData[0],showtime:showtime, price: price, availableSeats: availableSeats});
            // save the details
            theater.save()
            .then(result => {
                return res.status(200).send({
                    "status": 200,
                    "Success":{
                        "message": " Show Added Succesfully"
                    }
                }) 
            })
            .catch(err => {
                console.log(err);
                return res.status(400).send({
                    "status": 400,
                    "Error":{
                        "message": " database error"
                    }
                })
            })
        })    
    })
    .catch(err => {
        console.log(err);
        return res.status(400).send({
            "status": 400,
            "Error":{
                "message": " database error"
            }
        })
    })
}

exports.postLogin = (req, res, next) => {
    const { email, password} = req.body;
    // check for the existance of account
    Theater.find({email: email}).then(theaterData => {
        if(theaterData.length<1){
            return res.status(400).send({
                "status": 400,
                "Error":{
                    "message": " No Account found"
                }
            })
        }
        // create a token
        const payload = {userType: 'theater', id: theaterData[0].Id}
        const tokenData =  jwt.sign(payload, process.env.SECRET_KEY);
        const token = new Token({
            userType: 'theater',
            token: tokenData
        })
        token.save()
        .then(result => {
            req.session.theater = theaterData[0]
        
            return res.status(200).send({
                "status": 200,
                "success":{
                    "message": " login successfull",
                    "token": tokenData
                }
            })
        })
        // create token and save in session 


        
        

    })
}

exports.uploadImages = (req, res, next) => {
    const images = req.files.map(image => image.path);
    const theaterId = req.session.theater.Id
    Theater.find({Id: theaterId})
    .then(theaterData => {
        const theater = theaterData[0];
        theater.images = images

        theater.save()
        .then(result => {
            return res.status(200).send({
                "status": 200,
                "success":{
                    "message": " images uploaded successfully"
                }
            })
        })
        .catch(err => {
            return res.status(400).send({
                "status": 400,
                "Error":{
                    "message": "Error in uploading theater images"
                }
            })
        })
    })
}
exports.getMovies = (req, res, next) => {
    // const active = req.session.theater.active;
    // dont get movie details if the account is inactive
    // if(active === false){
    //     return res.status(200).send({
    //         "status": 200,
    //         "success":{
    //             "message": " Account is inactive by Admin"
    //         }
    //     })
    // }
    // find the movies that is currently active 
    Movie.find({active: true})
    .then(movies =>{
        if(movies.length<1){
            return res.status(200).send({
                "status": 200,
                "success":{
                    "message": "No movies found"
                }
            })
        }
        return res.status(200).send({
            "status": 200,
            "success":{
                "message": " Succesful"
            },
            "data": movies
        })
    })
    .catch(err => {
        console.log(err);
        return res.status(400).send({
            "status": 400,
            "Error":{
                "message": " Failed fetching movies"
            }
        })
    })

}


exports.getMovieSearch = (req, res, next) => {
    const searchKey = req.params.moviename;
    //find movie using keywords
    Movie.find({name: {$regex: searchKey, $options: 'i' }})
    .then(result => {
        if(result.length<1){
            return res.status(200).send({
                "status": 200,
                "success":{
                    "message": "No movies found"
                }
            })
        }
        return res.status(200).send({
            "Status" : 200,
            "Success" : {
                "Message" : " Successfull"
            },
            "data": result            
            
        })
    })
    .catch(err => {
        console.log(err);
        return res.status(400).send({
            "Status" : 400,
            "Error" : {
                "Message" : " error in getting search data"
            }            
            
        })
    })
}

exports.deleteShow = (req, res, next) =>{
    const showtime = req.params.showtime;
    const theaterId = req.session.theater.Id;
    // finding the theater from db to be updated
    Theater.find({Id: theaterId})
    .then(theaterData => {
        const theater = theaterData[0];
       // delete the show from the theater
        const shows = theater.shows.filter(show => show.showtime !== showtime);
        theater.shows = shows;
        theater.save()
        .then(result => {
            return res.status(200).send({
                "status": 200,
                "Success":{
                    "message": " Succesfully deleted"
                }
            })
        })
        .catch(err => {
            console.log(err);
            return res.status(400).send({
                "status": 400,
                "Error":{
                    "message": " deletion failed"
                }
            })
        })
    })
}
// update movie show by theater
exports.updateShow = (req, res, next) => {
    const theaterId = req.session.theater.Id;
    const showtime = req.params.showtime;
    const changedshowtime = req.body.showtime;
    const movieId = req.body.movieId;
    const price = req.body.price;
    const availableSeats = req.body.availableSeats;
    // find the theater to be updated
    Theater.find({Id: theaterId})
    .then(theaterData => {
        if(theaterData.length<1){
            return res.status(404).send({
                "status": 404,
                "Error":{
                    "message": " No theater found"
                }
            })
        }
        //update the show details
        const theater = theaterData[0];
        const index = theater.shows.findIndex(show => show.showtime === showtime)
        if(index<0){
            return res.status(404).send({
                "status": 404,
                "Error":{
                    "message": " No show found"
                }
            })
        }
        Movie.find({Id: movieId})
        .then(movieData => {
            theater.shows[index].movie = movieData[0];
            theater.shows[index].price = price;
            theater.shows[index].availableSeats = availableSeats;
            theater.shows[index].showtime = changedshowtime;
            theater.save()
            .then(result => {
                return res.status(200).send({
                    "status": 200,
                    "Success":{
                        "message": " Succesfully updated show"
                    }
                })
            })
            .catch(err => {
                console.log(err);
                return res.status(400).send({
                    "status": 400,
                    "Error":{
                        "message": " could not update show"
                    }
                })
            })
        })
        .catch(err => {
            console.log(err);
            return res.status(400).send({
                "status": 200,
                "Success":{
                    "message": " could not find movie to add"
                }
            })
        })
    })
    .catch(err => {
        console.log(err);
        return res.status(400).send({
            "status": 400,
            "Success":{
                "message": " could not find theater to add show"
            }
        })
    })
}

// get all shows
exports.getShows = (req, res, next) => {
    const theaterId = req.session.theater.Id;
    // get shows of the theater
    Theater.find({ Id: theaterId })
    .then(theaterData => {
        const theater = theaterData[0];
        if(theaterData.length<1){
            return res.status(404).send({
                "status": 404,
                "Error":{
                    "message": "No theaters found with the id"
                }
            })
        }
        return res.status(200).send({
            "status": 200,
            "Success":{
                "message": " Success"
            },
            "data": theater.shows
        })
    })
    .catch(err => {
        console.log(err);
        return res.status(400).send({
            "status": 400,
            "Error":{
                "message": "Errro in getting shows "
            }
        }) 
    })
}


exports.postLogout = (req, res, next) => {
    //logout the account
    const token = req.params.token
    req.session.theater = '';
    Token.deleteOne({token: token})
    .then(result => {
        return res.status(200).send({
            "status": 200,
            "success":{
                "message": "logged out"
            }
        })
    })
}


