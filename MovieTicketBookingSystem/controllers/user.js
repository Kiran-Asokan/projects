const crypto = require('crypto');
const fs = require('fs')
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const puppeteer = require('puppeteer')
const path = require('path')
const User = require('../models/user');
const Log = require('../models/log');
const Theater = require('../models/theater');
const Movie = require('../models/movie');
const Token = require('../models/token');

const moment = require('moment');
const theater = require('../models/theater');


dotenv.config()


// configure  mailing setup
const transporter = nodemailer.createTransport( {
     // Use your email service provider
    service: 'Gmail',
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASS,
    }
});

// creating an user account
exports.postSignup =(req, res, next) => {

    const email = req.body.email;
    const firstName = req.body.firstname;
    const lastName = req.body.lastname || null;
    const password = req.body.password;
    const phone = req.body.phone;
    const dob = req.body.dob || null
    const id = generateId(firstName);
    
    User.find({email: email})
    .then(user => {
        if(user.length>0){
            return res.status(409).send({
                "status": 409,
                "Error":{
                    "message": "Email Already Exist"
                }
            })
        }
        // encrypt the password for security
        const key = Buffer.alloc(32, process.env.SECRET_KEY);
        const iv = Buffer.alloc(16, 0)
        const algorithm = process.env.ALGORITHM

        const cipher = crypto.createCipheriv(algorithm, key, iv);
        let encryptedPassword = cipher.update(password, 'utf-8', 'hex');
        encryptedPassword += cipher.final('hex');

        // create a user object and save in database
        const newUser = new User({
            Id: id,
            firstName: firstName,
            lastName: lastName,
            email: email,
            password: encryptedPassword,
            phone: phone,
            dob: dob,
            active: true

        })
        // save the data to the collection 
        newUser.save()
        .then(result => {
            // res.status(201).json('User Created Succesfully')
            return res.status(200).send({
                "Status" : 200,
                "Success" : {
                    "Message" : "User Created Succesfully"
                }            
                
            })
        }).catch(err => {
            console.log(err);
            return res.status(400).send({
                "Status" : 400,
                "Error" : {
                    "Message" : "User Creation failed"
                }            
                
            })
        })
 
    })
    
           
}

// logging to user account
exports.postLogin = (req, res, next) => {
    
    const email = req.body.email
    // find the useraccount that is trying to login
    User.find({email: email})
    .then(userData => { 
        if(userData.length <1){
            return res.status(400).send({
                "status": 400,
                "Error":{
                    "message": " No Account found"
                }
            })
        }
        // if account found login and create a token and save in database
        const payload = {userType: 'user', id: userData[0].Id}
        const tokenData =  jwt.sign(payload, process.env.SECRET_KEY);
        const token = new Token({
            userType: 'user',
            token: tokenData
        })
        token.save()
        .then(result => {
            req.session.user = userData[0]
        
            return res.status(200).send({
                "status": 200,
                "success":{
                    "message": " user login successfull",
                    "token": tokenData
                }
            })
        })
        .catch(err => {
            console.log(err);
            return res.status(400).send({
                "Status" : 400,
                "Error" : {
                    "Message" : "User login failed"
                }            
                
            })
        })
        
       
    })
    .catch(err => {
        console.log(err);
        return res.status(400).send({
            "Status" : 400,
            "Error" : {
                "Message" : "User login failed"
            }            
            
        })
    })
    
}

// editing user account
exports.postEdit = (req, res, next) => {
    const userId = req.session.user.Id;
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;
    const phone = req.body.phone;
    const dob = req.body.dob;
    const profileImage = req.file.path || null
    // find the user to be updated
    User.find({Id: userId})
    .then(userData => {
        //update the details
        const user = userData[0]
        user.firstName = firstName
        user.lastName = lastName;
        user.phone = phone;
        user.dob = dob;
        profileImage && (user.profileImage = profileImage)

        user.save()
        .then(result => {
            return res.status(200).send({
                "Status" : 200,
                "Success" : {
                    "Message" : "User updated "
                }            
                
            })
        })
        .catch(err => {
            console.log(err);
            return res.status(400).send({
                "Status" : 400,
                "Error" : {
                    "Message" : "User not Updated "
                }            
                
            })
        })
    })
    .catch(err => {
        return res.status(400).send({
            "Status" : 400,
            "Error" : {
                "Message" : "data base error in user updating "
            }            
            
        })
    })
}

// sending password updation mail
exports.sendMail = (req, res, next) => {
    const email = req.session.user.email;
    const id = req.session.user.Id;
    const payload= {email: email, id: id}
    const token = jwt.sign(payload, process.env.SECRET_KEY)
    
    // configuring mail options
    const mailOptions = {
        from: process.env.EMAIL,
        to: email,
        subject: 'LINK TO UPDATE PASSWORD ',
        text: `<form action = "http://localhost:3000/change-password">
                <input type = "hidden" name = "token" value = "${token}">
                <button type = "submit"> Change Password </button>
                </form>`,
      };

      // sending mail
      transporter.sendMail(mailOptions)
      .then(result =>{
          return res.json('Sent Mail to Users Email Id')
      }).catch(err => {
        console.log(err);
        return res.json('Error in sending email')
      })
}

exports.authPassChange = (req, res, next) => {
    const token = req.body.email;
    const user = req.session.user;
    const payload = jwt.verify(token, process.env.SECRET_KEY)
    
    // authenticating the request that comes when change button in mail is clicked
    if(payload.email === user.email && payload.id === user.Id){
        return res.status(200).send({
            "Status": 200,
            "Success":{
                "message": "Password change Allowed"
            }
        })
    }
    return res.status(400).send({
        "Status": 400,
        "Error":{
            "message": "Password change not Allowed"
        }
    })

}

// updating password
exports.updatePassword = (req, res, next) => {
    const password = req.body.password;
    const userId = req.session.user.Id
    const key = Buffer.alloc(32, process.env.SECRET_KEY);
    const iv = Buffer.alloc(16, 0)
    const algorithm = process.env.ALGORITHM

    // encrypting password
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encryptedPassword = cipher.update(password, 'utf-8', 'hex');
    encryptedPassword += cipher.final('hex');

    // find user that need to update        
    User.find({Id: userId})
    .then(userData => {
        const user = userData[0]
        user.password = hashedPassword
        user.save()
        .then(result => {
            return res.status(200).send({
                "Status" : 200,
                "Success" : {
                    "Message" : "Password Updated "
                }            
                
            })
        }).catch(err => {
            return res.status(400).send({
                "Status" : 400,
                "Error" : {
                    "Message" : "password not Updated"
                }            
                
            })
        })
    }).catch(err => {
        console.log(err);
        return res.status(400).send({
            "Status" : 400,
            "Error" : {
                "Message" : "database error in password Update "
            }            
            
        })
    })
    
}

exports.getMovies = (req, res, next) => {
    // const active = req.session.user.active;
    // checking whether the account is made inactive by admin
    // if(active === false){
    //     return res.status(400).send({
    //         "Status" : 400,
    //         "Error" : {
    //             "Message" : " User Account not Active"
    //         }            
            
    //     }) 
    // }
    // finding the movies that can be visible to a user
    Movie.find({active: true})
    .then(movies => {
        if(movies.length<1){
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
                "Message" : " success"
            },
            "data": movies             
        }) 
    })
    .catch(err => {
        console.log(err);
        return res.status(400).send({
            "Status" : 400,
            "Error" : {
                "Message" : " Error in getting movies "
            }         
        })
    })
}

exports.getMovieSearch = (req, res, next) => {
    const searchKey = req.params.moviename;
    // finding movies using a search option
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

exports.getMovieSearchLocation = (req, res, next) => {
    // geting location that is searched
    const location = req.params.location;
    // theaters that is located in that location
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
        // getting movies that available to watch in that theaters without repeatation
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


exports.getTheaters = (req, res, next) => {
    
    const active = req.session.user.active;
    // checking for the user is active or not
    if(active === false){
        return res.status(400).send({
            "Status" : 400,
            "Error" : {
                "Message" : " User Account not Active"
            }            
            
        }) 
    }
    // finding the theaters that is visible to a user
    Theater.find({active: true})
    .then(theaters => {
        if(theaters.length<1){
            return res.status(200).send({
                "status": 200,
                "success":{
                    "message": "No theaters found"
                }
            })
        }
        return res.status(200).send({
            "Status" : 200,
            "Success" : {
                "Message" : " success"
            },
            "data": theaters             
        }) 
    })
    .catch(err => {
        console.log(err);
        return res.status(400).send({
            "Status" : 400,
            "Error" : {
                "Message" : " Error in getting theater "
            }         
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
// book ticket for show
exports.bookShow = (req, res, next) => {

    const bookingId = generateReferenceId();
    const tickets = req.body.tickets;
    const theaterId = req.body.theaterId;
    const showtime = req.body.showtime;
    
    // find theater to get show informatio
    Theater.find({Id: theaterId})
    .populate('shows.movie')
    .then(theaterData => {
        const theater = theaterData[0]
        if(theater.shows.length<1){
            return res.status(400).send({
                "Status" : 400,
                "Error" : {
                    "Message" : " No show at that theater"
                }            
                
            })
        }
        const show = theater.shows.filter(show => show.showtime === showtime)
        const index = theater.shows.findIndex(show => show.showtime === showtime);
        
        if(index<0){
            return res.status(400).send({
                "Status" : 400,
                "Error" : {
                    "Message" : " No show at that time"
                }            
                
            })
        }
        const movie = theater.shows[index].movie
        // updated seats after reducing the booked seats
        const availableSeats = theater.shows[index].availableSeats;
        if(tickets > availableSeats){
            return res.status(400).send({
                "Status" : 400,
                "Error" : {
                    "Message" : `Only ${availableSeats} tickets are available` 
                }            
                
            })
        }
        theater.shows[index].availableSeats -= tickets;
        theater.save()
        .then(result => {
            // creating an object that have details for the payment gateway
            const bookingData = {
                bookingId:bookingId,
                theater: theater,
                availableSeats: availableSeats-tickets,
                totalPrice: tickets*show[0].price,
                showtime: showtime,
                tickets: tickets,
                movie: movie,
                userName: req.session.user.firstName + ' ' + req.session.user.lastName,
                userEmail: req.session.user.email
            }
            
            req.body.bookingData = bookingData
            return next()
        })
    })
    .catch(err => {
        console.log(err);
        return res.status(400).send({
            "Status" : 400,
            "Error" : {
                "Message" : `Error in finding theater` 
            }            
            
        })
    })
        
           
}

exports.postReview = (req, res, next) => {
    const movieId = req.body.movieId;
    const review = req.body.review;
    // finding movie the review is to be added
    Movie.find({Id: movieId})
    .then(movieData => {
        const movie = movieData[0];
        // adding review and save 
        movie.reviews.push({user: req.session.user, review: review})
        movie.save()
        .then(result => {
            return res.status(200).send({
                "Status" : 200,
                "Success" : {
                    "Message" : " Review addedd"
                }            
                
            })
        })
        .catch(err => {
            console.log(err);
            return res.status(400).send({
                "Status" : 400,
                "Error" : {
                    "Message" : " review adding failed"
                }            
                
            })
        })
    })
    .catch(err => {
        console.log(err);
        return res.status(400).send({
            "Status" : 400,
            "Error" : {
                "Message" : " Error review adding"
            }            
            
        })
    })
}

exports.updateReview = (req, res, next) => {
    const movieId = req.body.movieId;
    const review = req.body.review;
    const user = req.session.user;
    // finding movie the review is to be added
    Movie.find({Id: movieId})
    .then(movieData => {
        const movie = movieData[0];
        // adding review and save
        const index = movie.reviews.findIndex(review => review.user === user) 
        movie.reviews[index] = {user: user, review: review}
        movie.save()
        .then(result => {
            return res.status(200).send({
                "Status" : 200,
                "Success" : {
                    "Message" : " Review Updated "
                }            
                
            })
        })
        .catch(err => {
            console.log(err);
            return res.status(400).send({
                "Status" : 400,
                "Error" : {
                    "Message" : " review updation failed"
                }            
                
            })
        })
    })
    .catch(err => {
        console.log(err);
        return res.status(400).send({
            "Status" : 400,
            "Error" : {
                "Message" : " Error review updation"
            }            
            
        })
    })
}


exports.deleteReview = (req, res, next) => {
    const movieId = req.params.movieId;
    const user = req.session.user;
    Movie.find({Id: movieId})
    .then(movieData => {
        const movie = movieData[0];
        const reviews = movie.reviews.filter(review => review.user !== user);
        movie.reviews = reviews;
        movie.save()
        .then(result => {
            return res.status(200).send({
                "Status" : 200,
                "Success" : {
                    "Message" : " Review deleted"
                }            
                
            })
        })
        .catch(err => {
            console.log(err);
            return res.status(400).send({
                "Status" : 400,
                "Error" : {
                    "Message" : " review adding failed"
                }            
                
            })
        })
    })
    .catch(err => {
        console.log(err);
        return res.status(400).send({
            "Status" : 400,
            "Error" : {
                "Message" : " review adding failed"
            }            
            
        })
    })
}

// peyment middleware
exports.payment = (req, res, next) => {

    req.body.bookingStatus = 'Success';
    req.body.paymentDate = moment().format()
    return next();
}

exports.completeBooking = async (req, res, next) => {
    // finalising the booking
    
    const bookingData = req.body.bookingData;
    const bookingStatus = req.body.bookingStatus;
    const bookingDate = req.body.paymentDate;
    const userEmail = req.body.bookingData.userEmail;
    //if the booking failed update the seats available by adding no of tickets
    
    Theater.find({Id: bookingData.theaterId})
    .then(async theaterData => {
        if(bookingStatus !== 'Success'){
            const log = new Log({
                bookingId: bookingData.bookingId,
                tickets: bookingData.tickets,
                user: req.session.user,
                theater: bookingData.theater,
                movie: bookingData.movie,
                showtime: bookingData.showtime,
                totalPrice: bookingData.totalPrice,
                status: bookingStatus,
                date: bookingDate
            })
            log.save()
            const theater = theaterData[0];
            const index = theater.shows.findIndex(show => show.showtime === bookingData.showtime)
            theater.shows[index].availableSeats += bookingData.tickets
            theater.save()
            .then(result => {
                return res.status(400).send({
                    "status": 400,
                    "Error":{
                        "message": "booking failed"
                    }
                })
            })
        }
        
        
        
        const pdfDocName = bookingData.bookingId + '.pdf'
        const pdfDocPath = path.join('Data', 'reciepts', pdfDocName)
        await createPdf(bookingData, bookingStatus)
        const file = fs.createReadStream(pdfDocPath);
        res.setHeader('Content-Type', 'application/pdf')
        res.setHeader('Content-Disposition', 'attachment');
        file.pipe(res)
        // save log to the database
        const log = new Log({
            bookingId: bookingData.bookingId,
            tickets: bookingData.tickets,
            user: req.session.user,
            theater: bookingData.theater,
            movie: bookingData.movie,
            showtime: bookingData.showtime,
            totalPrice: bookingData.totalPrice,
            status: bookingStatus,
            date: bookingDate
        })
        log.save()
        
        // configuring mail options
        const mailOptions = {
            from: process.env.EMAIL,
            to: userEmail,
            subject: 'ticket Confirmation ',
            attachments: [
                {
                filename: pdfDocName, // Filename of the attachment
                path: pdfDocPath, // Path to the attachment file
                },
            ]
        };
    })
            

      // sending mail
    // transporter.sendMail(mailOptions)

            

        
    

}

exports.cancelTicket =   (req, res, next) => {
    const bookingId = req.params.bookingId;
    const email = req.session.user.email;
    // finding the booking id that need to be cancelled
    Log.find({bookingId: bookingId})
    .populate('theater')
    .then(async logData => {
        
        const log = logData[0];
        const bookedDate = log.date
        const bookedDateonly = moment(bookedDate).format('DD-MM-YY')
        

        
        if(bookedDateonly == moment().format('DD-MM-YY')){
            const currentTime = moment().format('HH:mm')
            const showTime = moment(log.showtime,'HH:mmA').format('HH:mm');

            const [hours1, minutes1] = currentTime.split(':').map(Number);
            const [hours2, minutes2] = showTime.split(':').map(Number);

            const  differenceInMinutes = (hours2 * 60 + minutes2) - (hours1 * 60 + minutes1);

            if(differenceInMinutes < 30){
                return res.status(200).send({
                    "status": 200,
                    "Success":{
                        "message": "Cancellation is not allowed 30 minutes before the show time"
                    }
                })
            }
        }
        const theater = log.theater;
        const showtime = log.showtime;
        const tickets = log.tickets;
        const totalPrice = log.totalPrice;
        // finding the theater to update the seats avaiable
        Theater.find({Id: theater.Id})
        .then(theaterData => {
            const theater = theaterData[0]
            const showIndex = theater.shows.findIndex(show => show.showtime === showtime) 
            const availableSeats = theater.shows[showIndex].availableSeats;
            theater.shows[showIndex].availableSeats += tickets;
            theater.save()
            .then(result => {
                // updating the status of booking to cancelled
                req.body.totalprice = totalPrice;
                log.status = 'Cancelled'
                log.save()
                .then(result => {
                    // send a cancellation mail
                    const mailOptions = {
                        from: process.env.EMAIL,
                        to: email,
                        subject: 'ticket Cancelled ',
                        text: '<html><body>Ticket Cancellation Summary</body></html>'
                      };
                
                      // sending mail
                    // transporter.sendMail(mailOptions)
                    return next()
                })
                .catch(err => {
                    console.log(err);
                    return res.status(400).send({
                        "status": 400,
                        "Error":{
                            "message": "error ticket cancelation"
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
                    "message": "error ticket cancelation"
                }
            })
        })
    })
    .catch(err => {
        console.log(err);
        return res.status(400).send({
            "status": 400,
            "Error":{
                "message": "error ticket cancelation"
            }
        })
    })

}


exports.refund = (req, res, next) => {
    const amount = req.body.totalPrice;
    req.body.refundStatus = 'done'
    return res.status(200).send({
        "status": 200,
        "Success":{
            "message": "ticket cancelation success and refund initiated"
        }
    })
}

exports.completeCancellation = (req, res, next) => {
    const bookingId = req.params.bookingId;
    
    const mailOptions = {
        from: process.env.EMAIL,
        to: userEmail,
        subject: 'ticket Cancelled ',
        text: '<html><body>Ticket Cancellation Summary</body></html>'
      };

      // sending mail
    // transporter.sendMail(mailOptions)

    // update status in log
    Log.find({bookingId: bookingId})
    .then(logData => {
        const log = logData[0];
        log.status = 'Cancelled'
        log.save()
        .then(result => {
           return next()
        })  
    })
    .catch(err => {
        console.log(err);
        res.status(400).send({
            "status": 400,
            "Error":{
                "message": "Error occured in Cancellation"
            }
        })
    })
}
// logout user account
exports.postLogout = (req, res, next) => {
    const token = req.params.token
    req.session.user = '';
    // delete token from database
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

// generate a random id from name
function generateId(name) {
    let id = '';
    const namestring = name.split(' ').join('')
    let str =  namestring + '0123456789';
    // generate an id 
    for (let i = 1; i <= 4; i++) {
        let char = Math.floor(Math.random()
            * str.length + 1);
 
        id += str.charAt(char)
    }
 
    return id;
}

function generateReferenceId() {
    let id = '';
    let str = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890'
    // generate booking id for every booking 
    for (let i = 1; i <= 12; i++) {
        let char = Math.floor(Math.random()
            * str.length + 1);
 
        id += str.charAt(char)
    }
 
    return id;
}

async function createPdf(bookingData, bookingStatus, theater, movie) {
    // create confirmation pdf dynamically
    const content = `
        <html>
        <style>
            .movie{
                font-size: 15 px;
            }
            .payment{
                color:'red';
            }
        </style>
        <body>
        <div class = "theater">
            <span>booking id</span>
            <h5> ${bookingData.bookingId} </h5>
            
        </div>
        <div class = "theater">
            <span>theater</span>
            <h2> ${bookingData.theater.name} </h2>
            
        </div>
        <div class = "movie">
            <span>movie</span>
            <h1> ${bookingData.movie.name} </h1>

        </div>
        <div class = "tickets">
            <span>tickets</span>
            <h3> ${bookingData.tickets} </h3>

        </div>
        <div class = "showtime">
            <span>showtime</span>
            <h3> ${bookingData.showtime} </h3>
            
        </div>
        <div class = "amount">
            <span>total amount</span>
            <h3> ${bookingData.totalPrice} </h3>
            
        </div>
        <div class = "payment">
            <span>payment</span>
            <h3> ${bookingStatus} </h3>
            
        </div>
        </body>
        </html>

    `

    const browser = await puppeteer.launch({
        headless: "new"
    });
    const page = await browser.newPage();

    await page.setContent(content);
    const pageStream = await page.pdf({ format: 'A6' });

    const pdfDocName = bookingData.bookingId + '.pdf'
    const pdfDocPath = path.join('Data', 'reciepts', pdfDocName)
    const writeStream = fs.createWriteStream(pdfDocPath);
    writeStream.write(pageStream);
    writeStream.end();

    await browser.close();
}

