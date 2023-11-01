const bcrypt = require('bcrypt');
const crypto = require('crypto');
const dotenv = require('dotenv')
const moment = require('moment')
const jwt = require('jsonwebtoken')
const User = require('../models/user');
const Admin = require('../models/admin');
const Theater = require('../models/theater');
const Token = require('../models/token')
dotenv.config();

// verifying the user login 
exports.verifyUser = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    
    User.find({email: email})
    .then((user) => {
        if(user.length<1){
            return res.status(400).send({
                "Status" : 400,
                "Success" : {
                    "Message" : "no User Found"
                }            
                
            })
        }
        const encryptedPassword = user[0].password;
        const key = Buffer.alloc(32, process.env.SECRET_KEY);
        const iv = Buffer.alloc(16, 0)
        const algorithm = process.env.ALGORITHM
        const decipher = crypto.createDecipheriv(algorithm, key, iv);
            
        let decryptedPassword = decipher.update(encryptedPassword, 'hex', 'utf-8');
        decryptedPassword += decipher.final('utf-8');
        if(decryptedPassword === password){
            return next();
        }
        return res.status(400).send({
            "Status" : 400,
            "Error" : {
                "Message" : "Password is Incorrect"
            }            
            
        })
    })
    .catch(err => {
        console.log(err);
        return res.status(400).send({
            "Status" : 400,
            "Success" : {
                "Message" : "database error in user login"
            }            
            
        })
    })
}

// verifying the admin login
exports.verifyAdmin = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;

    Admin.find({email: email})
    .then((admin) => {
        if(admin.length<1){
            return res.status(404).send({
                "status": 404,
                "error": {
                    "message": " account not found"
                }
            })
        }
        const encryptedPassword = admin[0].password;
        const key = Buffer.alloc(32, process.env.SECRET_KEY);
        const iv = Buffer.alloc(16, 0)
        const algorithm = process.env.ALGORITHM
        const decipher = crypto.createDecipheriv(algorithm, key, iv);
            
        let decryptedPassword = decipher.update(encryptedPassword, 'hex', 'utf-8');
        decryptedPassword += decipher.final('utf-8');

        if(decryptedPassword === password){
            return next();
        }
        return res.status(400).send({
            "status": 400,
            "error": {
                "message": " Wrong Password"
            }
        })


    })
}

// checking the user is authorized
exports.authorize = (req, res, next) => { 
    // console.log(req.session);
    const token = req.headers['authorization'].split(' ')[1]
    if(!token || token<0){
        return res.status(400).send({
            "status": 400,
            "error": {
                "message": " No token "
            }
        })
    }

    //const payload = jwt.verify(token, process.env.SECRET_KEY) ?? null
    jwt.verify(token, process.env.SECRET_KEY, (err, payload) => {
        if(err){
            console.log( err);
            return res.status(400).send({
                "status": 400,
                "error": {
                    "message": " Invalid Token"
                }
            }) 
        }
        Token.find({token: token})
        .then(tokenData =>{
            const token = tokenData[0];
            if(!token){
                return res.status(400).send({
                    "status": 400,
                    "error": {
                        "message": " Invalid Token"
                    }
                })
            }
            
            // let Id;
            // if(token.userType === 'admin'){
            //     Id = req.session.admin.Id
            // }else if(token.userType === 'theater'){
            //     Id = req.session.theater.Id
            // }else{
            //     Id = req.session.user.Id
            // }
        // if(Id !== payload.id){
        //     console.log('no intented user');
        //     return res.status(400).send({
        //         "status": 400,
        //         "error": {
        //             "message": " Not Authorized"
        //         }
        //     })
        // }

        // all the three account type can be logged in simultaniously
        // if(req.session.admin !== '' && payload.userType === 'admin' || 
        // req.session.theater !== '' && payload.userType === 'theater' ||
        // req.session.user !== '' && payload.userType === 'user' ){
            return next()

        // }else{
        //     return res.status(400).send({
        //         "status": 400,
        //         "error": {
        //             "message": " Not Authorized"
        //         }
        //     })
        // }

        
    })
    })
    

}
    


// verifying the theater login
exports.verifyTheater = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password
    
    Theater.find({email: email})
    .then((theater) => {
        if(theater.length<1){
            return res.json('Theater Does not Exist')
        }
        
        const current_date = moment().format()
        

        if(theater[0].expiration < current_date){
            return res.status(400).send({
                "Status" : 400,
                "Error" : {
                    "Message" : "Password expired"
                }            
                
            })
        }

        const key = Buffer.alloc(32, process.env.SECRET_KEY);
        const iv = Buffer.alloc(16, 0)
        const algorithm = process.env.ALGORITHM
        const decipher = crypto.createDecipheriv(algorithm, key, iv);
            
        let decryptedPassword = decipher.update(theater[0].password, 'hex', 'utf-8');
        decryptedPassword += decipher.final('utf-8');
        
            if(decryptedPassword === password ){
                return next();
            }
            return res.status(400).send({
                "Status" : 400,
                "Error" : {
                    "Message" : "logging in failed , Wrong password"
                }            
                
            })
            
        }).catch(err => {
            console.log(err);
            return res.status(400).send({
                "Status" : 400,
                "Error" : {
                    "Message" : "failed"
                }            
                
            })
        })
    
}

// check email for usersign up
// exports.checkEmail = (req, res, next) => {
//     const email = req.body.email;
//     User.find({email: email})
//     .then(user => {
//         if(user.length>0){
//             return res.status(409).send({
//                 "status": 409,
//                 "Error":{
//                     "message": "Email Already Exist"
//                 }
//             })
//         }
//         return next();
//     })
// }

