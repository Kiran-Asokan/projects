const crypto = require('crypto');
const jwt = require('jsonwebtoken')
const dotenv = require('dotenv');
const Admin = require('../models/admin');
const moment = require('moment')
const Movie = require('../models/movie');
const Theater = require('../models/theater');
const User = require('../models/user');
const Token = require('../models/token')
dotenv.config();
// create account
exports.postSignup = async (req, res, next) => {
    // get all data from body
    const firstname = req.body.firstname;
    const lastname = req.body.lastname;
    const email = req.body.email;
    const password = req.body.password;
    const phone = req.body.phone;
    const id = generateId(firstname);
    // check wheather the email already used 
    Admin.find({email: email})
    .then(adminUser => {
        if(adminUser.length>0){
            res.status(409).send({
                "status": 409,
                "Error":{
                    "message": " Already an account with this Email"
                }
            })
        }
        // encrypt the password and save in db
        const key = Buffer.alloc(32, process.env.SECRET_KEY);
        const iv = Buffer.alloc(16, 0)
        const algorithm = process.env.ALGORITHM

        const cipher = crypto.createCipheriv(algorithm, key, iv);
        let encryptedPassword = cipher.update(password, 'utf-8', 'hex');
        encryptedPassword += cipher.final('hex');
        
        
            const admin = new Admin({
                Id: id,
                firstname: firstname,
                lastname: lastname,
                email: email,
                password: encryptedPassword,
                phone: phone
            })
            // save the data to the collection 
            admin.save()
            .then(result => {
                res.status(200).send({
                    "status": 200,
                    "success":{
                        "message": " Account Created"
                    }
                })
            })
    
        }).catch(err => {
            console.log(err);
            return res.status(400).send({
                "status": 400,
                "Error":{
                    "message": " Account Creation Failed"
                }
            })
        })
}
// login to account
exports.postLogin = (req, res, next) => {
    const { email} = req.body;
    
    // finding the account to be logged in
    Admin.find({email: email}).then(adminData => {
        if(adminData.length<1){
            return res.status(400).send({
                "status": 400,
                "Error":{
                    "message": " No Account found"
                }
            })
        }
        // create a token and saves
        const payload = {userType: 'admin', id: adminData[0].Id}
        const tokenData =  jwt.sign(payload, process.env.SECRET_KEY);
        const token = new Token({
            userType: 'admin',
            token: tokenData
        })
        token.save()
        .then(async result => {
            // setting user in the session
            await addToSession(req, adminData[0])
            
            console.log(req.session);
            return res.status(200).send({
                "status": 200,
                "success":{
                    "message": " login successfull",
                    "token": tokenData
                }
            })
            
        }) 
        
        

    })
    
}

exports.editProfile = (req, res , next) => {
    const firstname = req.body.firstname || null;
    const lastname = req.body.lastname || null;
    const profileImage = req.file.path || null;
    const adminId = req.session.admin.Id;

    Admin.find({Id:adminId})
    .then(adminData => {
        const admin = adminData[0]
        firstname && (admin.firstname = firstname)
        lastname && (admin.lastname = lastname)
        profileImage && (admin.profileImage =  profileImage)
        admin.save()
        .then(result => {
            return res.status(200).send({
                "status": 200,
                "Status":{
                    "message": " profile Updated"
                }
            })
        }).catch(err => {
            console.log(err);
            return res.status(400).send({
                "status": 400,
                "Error":{
                    "message": " profile Update failed"
                }
            })
        })
    })
}
exports.updatePassword = (req, res, next) => {
    const password = req.body.password;
    const adminId = req.session.admin.Id;

    // find theater from collection to change password
    Admin.find({Id: adminId})
    .then(adminData => {

        // encrypt password
        const key = Buffer.alloc(32, process.env.SECRET_KEY);
        const iv = Buffer.alloc(16, 0)
        const algorithm = process.env.ALGORITHM

        const cipher = crypto.createCipheriv(algorithm, key, iv);
        let encryptedPassword = cipher.update(password, 'utf-8', 'hex');
        encryptedPassword += cipher.final('hex');
        const admin = adminData[0]
        admin.password = encryptedPassword
        // change validity of password to 1 year
        admin.expiration = moment().add(1, 'year').format()
        // save the admin details
        admin.save()
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

// add movie to the system
exports.addMovie = (req, res, next) => {
    
    const name = req.body.name;
    const language = req.body.language;
    const duration = req.body.duration;
    const genre = req.body.genre;
    const description = req.body.description;
    const posters = req.files.map(poster => poster.path);
    console.log(req.files); 
    const Id = generateId(name);
    // checking if the movie already exist
    Movie.find({name: name})
    .then(mov => {
        if(mov.length>0){
            return res.status(409).send({
                "status": 409,
                "Error": {
                    "message": " Movie  already Exist"
                }
            })
        }
        // creating new movie object and save
        const movie = new Movie({
            Id: Id,
            name: name,
            language: language,
            duration: duration,
            genre: genre,
            description: description,
            active: true,
            posters:posters,
        })
        movie.save()
        .then(result => {
            return res.status(200).send({
                "status": 200,
                "success": {
                    "message": " Movie  Added"
                }
            })
        }).catch(err => {
            console.log(err);
            return res.status(400).send({
                "status": 400,
                "Error": {
                    "message": " Movie  Adding Failed"
                }
            })
        })
    })
}

// add theater to the system
exports.addTheater = async (req, res, next) => {
    const name = req.body.name;
    const location = req.body.location;
    const email = req.body.email;
    const phone = req.body.phone;
    const password =  generatePass();
    const expiration = moment().add(1, 'days').format();
    const id = generateId(name);
    console.log(password);

    // checking if the theater already exist or not
    Theater.find({email: email})
    .then(theaterdata => {
        if(theaterdata.length>0){
            return res.status(409).send({
                "status": 409,
                "Error":{
                    "message": "Theater already exist"
                }
            })
        }

        // encrypt the password and save the theater object
        const key = Buffer.alloc(32, process.env.SECRET_KEY);
        const iv = Buffer.alloc(16, 0)
        const algorithm = process.env.ALGORITHM

        const cipher = crypto.createCipheriv(algorithm, key, iv);
        let encryptedPassword = cipher.update(password, 'utf-8', 'hex');
        encryptedPassword += cipher.final('hex');

        const theater = new Theater({
            Id: id,
            name: name,
            location: location,
            email: email,
            phone: phone,
            password: encryptedPassword,
            expiration: expiration,
            active: true
        })
        theater.save()
        .then(result => {
            return res.status(200).send({
                "status": 200,
                "Success":{
                    "message": "Theater added"
                }
            })
        })
        .catch(err => {
            return res.status(400).send({
                "status": 400,
                "Success":{
                    "message": "Theater not Added"
                }
            })
        })
    })
    
}

// edit movie that is already added
exports.editMovie = (req, res, next) => {
    const movieId = req.params.movieId;
    const name = req.body.name;
    const language = req.body.language;
    const duration = req.body.duration;
    const genre = req.body.genre;
    const description = req.body.description;

    // finding the movie to be edited
    Movie.findById(movieId)
    .then(movie => {
        // update the movie in the db
        movie.name = name;
        movie.language = language;
        movie.duration = duration;
        movie.genre = genre;
        movie.description = description;

        movie.save()
        .then(result => {
            return res.status(200).send({
                "status": 200,
                "Success":{
                    "message": "Movie details Updated"
                }
            })
        })
        .catch(err => {
            console.log(err);
            return res.status(400).send({
                "status": 400,
                "Success":{
                    "message": "Movie not Updated"
                }
            })
        })
    })
    .catch(err => {
        console.log(err);
        return res.status(400).send({
            "status": 400,
            "Success":{
                "message": "error in updating Movie"
            }
        })
    })
}

// edit user that already exist
exports.editUser = (req, res, next) => {
    const userId = req.params.userId;
    const firstname = req.body.firstname;
    const lastname = req.body.lastname;
    const phone = req.body.phone;
    const dob = req.body.dob;

    // finding the user to edit
    User.find({Id: userId})
    .then(userData => {
        // update and save the user
        const user = userData[0];
        user.firstName = firstname;
        user.lastName = lastname;
        user.phone = phone;
        user.dob = dob;

        user.save()
        .then(result => {
            return res.status(200).send({
                "status": 200,
                "Success":{
                    "message": "User details Updated"
                }
            })
        })
        .catch(err => {
            console.log(err);
            return res.status(400).send({
                "status": 400,
                "Success":{
                    "message": "User not Updated"
                }
            })
        })
    })
    .catch(err => {
        console.log(err);
        return res.status(400).send({
            "status": 400,
            "Success":{
                "message": "error in updating User"
            }
        })
    })
}

// edit theater that already added
exports.editTheater = (req, res, next) => {
    const theaterId = req.params.theaterId;
    const name = req.body.name;
    const location = req.body.location;
    const phone = req.body.phone;

    // finding the theater to edit
    Theater.find({Id: theaterId})
    .then(theaterData => {

        // update and save the theater
        const theater = theaterData[0] 
        theater.name = name;
        theater.location = location;
        theater.phone = phone;

        theater.save()
        .then(result => {
            return res.status(200).send({
                "status": 200,
                "Success":{
                    "message": "Theater details Updated"
                }
            })
        })
        .catch(err => {
            console.log(err);
            return res.status(400).send({
                "status": 400,
                "Success":{
                    "message": "Theater not Updated"
                }
            })
        })
    })
    .catch(err => {
        console.log(err);
        return res.status(400).send({
            "status": 400,
            "Success":{
                "message": "error in updating theater"
            }
        })
    })
}

// get list of movies
exports.getMovies = (req, res, next) => {

    Movie.find().then(movies => {
        if(movies.length<1){
            return res.status(200).send({
                "status": 200,
                "success":{
                    "message": "No Movie found"
                }
            })
        }
        return res.status(200).send({
            "status": 200,
            "success":{
                "message": "successfull"
            },
            "data": movies
        })

    })
}

// search for movies
exports.getMovieSearch = (req, res, next) => {
    const searchKey = req.params.moviename;
    Movie.find({name: {$regex: searchKey, $options: 'i' }})
    .then(result => {
        if(result.length<1){
            return res.status(200).send({
                "status": 200,
                "success":{
                    "message": "No Movie found"
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

// search for movies by location
exports.getMovieSearchLocation = (req, res, next) => {
    const location = req.params.location;
    // find theaters in that location
    Theater.find({location: location})
    .populate('shows.movie')
    .then(theaterData => {

        if(theaterData.length<1){
            return res.status(200).send({
                "status": 200,
                "success":{
                    "message": "No Movie found in this location"
                }
            })
        }

        // get movies in that theaters
        const movieList = theaterData.map(theater => {
            const movieList  = Array.from(new Set(theater.shows.map(item => item.movie)))
            return movieList
        })
        const movies = Array.from(new Set(movieList.flat().map(item => item)));
        if(movies.length<1){
            return res.status(200).send({
                "status": 200,
                "success":{
                    "message": "No Movie found in this location"
                }
            })
        }
        return res.status(200).send({
            "Status" : 200,
            "Success" : {
                "Message" : " successfull"
            },
            "data":   movies         
            
        })
        
    })
    .catch(err => {
        console.log(err);
        return res.status(400).send({
            "Status" : 400,
            "Error" : {
                "Message" : " failed to load data"
            }    
            
        })
    })
}

// get list of users
exports.getUsers = (req, res, next) => {
    User.find().then(users => {
        if(users.length<1){
            return res.status(200).send({
                "status": 200,
                "success":{
                    "message": "No users found"
                }
            })
        }
        return res.status(200).send({
            "status": 200,
            "success":{
                "message": "successfull"
            },
            "data": users
        })

    })
}

// getlist of theaters
exports.getTheaters = (req, res, next) => {
    Theater.find().then(theaters => {
        if(theaters.length<1){
            return res.status(200).send({
                "status": 200,
                "success":{
                    "message": "No theaters found"
                }
            })
        }
        return res.status(200).send({
            "status": 200,
            "success":{
                "message": "successfull"
            },
            "data": theaters
        })

    })
}

exports.getTheatersByMovie = (req, res, next) => {
    const movieId = req.params.movieId
    Theater.find()
    .populate('shows.movie')
    .then(theaters =>{
        const theatersWithMovie = theaters.filter(theater => {
            return theater.shows.filter(shows => {shows.movie.Id === movieId})

        })
        return res.status(200).send({
            "Status" : 200,
            "Success" : {
                "Message" : " successfull"
            },
            "data":theatersWithMovie             
            
        })
    })
    .catch(err => {
        console.log(err);
        return res.status(400).send({
            "Status" : 400,
            "Error" : {
                "Message" : " Error in finding theaters"
            }             
            
        })
    })
}

// delete a theater
exports.deleteTheater = (req, res, next) => {
    const theaterId = req.params.theaterId

    Theater.deleteOne({Id: theaterId})
    .then(result => {
        return res.status(200).send({
            "status": 200,
            "success":{
                "message": "successfully deleted"
            }
        })
    }).catch(err => {
        console.log(err);
        return res.status(200).send({
            "status": 200,
            "Error":{
                "message": "theater delete failed"
            }
        })
    })

}

// delete a user
exports.deleteUser = (req, res, next) => {
    const userId = req.params.userId

    User.deleteOne({Id: userId})
    .then(result => {
        return res.status(200).send({
            "status": 200,
            "success":{
                "message": "User successfully deleted"
            }
        })
    }).catch(err => {
        console.log(err);
        return res.status(200).send({
            "status": 200,
            "Error":{
                "message": "User delete failed"
            }
        })
    })

}

// delete a movie
exports.deleteMovie = (req, res, next) => {
    const movieId = req.params.movieId

    Movie.deleteOne({_id: movieId})
    .then(result => {
        return res.status(200).send({
            "status": 200,
            "success":{
                "message": "movie successfully deleted"
            }
        })
    }).catch(err => {
        console.log(err);
        return res.status(400).send({
            "status": 400,
            "Error":{
                "message": "movie delete failed"
            }
        })
    })

}

// set a user active or inactive
exports.editActivityUser = (req, res, next) => {
    const userId = req.params.userId;
    const active = req.body.active;
    User.find({Id: userId})
    .then(userData => {
        const user = userData[0];
        user.active = active;
        user.save()
        .then(result => {
            return res.status(200).send({
                "status": 200,
                "success":{
                    "message": "successfull"
                }
            })
        })
    })
}

// set a theater active or inactive
exports.editActivityTheater = (req, res, next) => {

    const theaterId = req.params.theaterId;
    const active = req.body.active;
    Theater.find({Id: theaterId})
    .then(theaterData => {
        const theater = theaterData[0];
        theater.active = active
        theater.save()
        .then(result => {
            return res.status(200).send({
                "status": 200,
                "success":{
                    "message": "successfull"
                }
            })
        })
    })

}

// set a movie active or inactive
exports.editActivityMovie = (req, res, next) => {


    User.findById(movieId)
    .then(movie => {
        movie.active = active;
    })

    const movieId = req.params.movieId;
    const active = req.body.active;
    Movie.find({Id: movieId})
    .then(movieData => {
        const movie = movieData[0];
        movie.active = active
        movie.save()
        .then(result => {
            return res.status(200).send({
                "status": 200,
                "success":{
                    "message": "successfull"
                }
            })
        })
    })
    

}

// logout
exports.postLogout = (req, res, next) => {
    const token = req.params.token
    req.session.admin = '';
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

// function to generate a temporary 8 digit  password
function generatePass() {
    let pass = '';
    let str = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' +
        'abcdefghijklmnopqrstuvwxyz0123456789@#$';
 
    for (let i = 0; i <= 8; i++) {
        let char = Math.floor(Math.random()
            * str.length + 1);
 
        pass += str.charAt(char)
    }
 
    return pass;
}

// generate an unique id 
function generateId(name) {
    let id = '';
    const namestring = name.split(' ').join('')
    let str =  namestring + '0123456789';
    for (let i = 1; i <= 4; i++) {
        let char = Math.floor(Math.random()
            * str.length + 1);
 
        id += str.charAt(char)
    }
 
    return id;
}

async function addToSession(req, data){
    req.session.admin = data
}
