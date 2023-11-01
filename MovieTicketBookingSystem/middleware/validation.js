exports.adminLoginvalidation = (req, res, next) => {
    if(req.session.admin){
        return res.status(400).send({
            "status": 400,
            "Error":{
                "message": " Already logged in the admin account . log out first"
            }
        })
    }
    // regex for email
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    const email = req.body.email;
    const password = req.body.password;
    // checking for rmpty values
    if(email === '' || email.trim() === '' || password === '' || password.trim() === ''){
        return res.status(400).send({
            "Status" : 400,
            "Error" : {
                "Message" : "No empty values are allowed"
            }            
            
        })
    }
    // checking for valid email format
    if (!emailRegex.test(email)) {
        return res.status(400).send({
            "Status" : 400,
            "Error" : {
                "Message" : "invalid email format"
            }            
            
        })
    }
    // checking password length
    if(password.length<8){
        return res.status(400).send({
            "Status" : 400,
            "Error" : {
                "Message" : "password length must be greater than 8"
            }            
            
        })
    }
    return next();
}

exports.userLoginvalidation = (req, res, next) => {
    if(req.session.user){
        return res.status(400).send({
            "status": 400,
            "Error":{
                "message": " Already logged in the user account . log out first"
            }
        })
    }
    // regex for email
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    const email = req.body.email;
    const password = req.body.password;

    // checking for rmpty values
    if(email === '' || email.trim() === '' || password === '' || password.trim() === ''){
        return res.status(400).send({
            "Status" : 400,
            "Error" : {
                "Message" : "No empty values are allowed"
            }            
            
        })
    }
    // checking for valid email format
    if (!emailRegex.test(email)) {
        return res.status(400).send({
            "Status" : 400,
            "Error" : {
                "Message" : "invalid email format"
            }            
            
        })
    }
    // checking password length
    if(password.length<8){
        return res.status(400).send({
            "Status" : 400,
            "Error" : {
                "Message" : "password length must be greater than 8"
            }            
            
        })
    }
    return next();
}
exports.theaterLoginvalidation = (req, res, next) => {
    if(req.session.theater){
        return res.status(400).send({
            "status": 400,
            "Error":{
                "message": " Already logged in the theater account . log out first"
            }
        })
    }
    // regex for email
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    const email = req.body.email;
    const password = req.body.password;

    // checking for rmpty values
    if(email === '' || email.trim() === '' || password === '' || password.trim() === ''){
        return res.status(400).send({
            "Status" : 400,
            "Error" : {
                "Message" : "No empty values are allowed"
            }            
            
        })
    }
    // checking for valid email format
    if (!emailRegex.test(email)) {
        return res.status(400).send({
            "Status" : 400,
            "Error" : {
                "Message" : "invalid email format"
            }            
            
        })
    }
    // checking password length
    if(password.length<8){
        return res.status(400).send({
            "Status" : 400,
            "Error" : {
                "Message" : "password length must be greater than 8"
            }            
            
        })
    }
    return next();
}

exports.adminSignup = (req, res, next) => {
    const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@#$%^&+=!])(?!.*\s).{8,16}$/;
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    const firstname = req.body.firstname;
    const lastname = req.body.lastname;
    const email = req.body.email;
    const password = req.body.password;
    const confirmedPassword = req.body.confirmedpassword;
    const phone = req.body.phone;

    // checking for empty values
    if(firstname === '' || 
    firstname.trim()=== ''|| 
    email === '' || 
    email.trim() === '' || 
    password === '' || 
    password.trim() === '' ||
    confirmedPassword === '' ||
    confirmedPassword.trim() === '' ||
    phone === '' || phone.trim() === ''){
        return res.status(400).send({
            "Status" : 400,
            "Error" : {
                "Message" : "No empty values are allowed"
            }            
            
        })
    }
    // valid email check
    if(!passwordRegex.test(password)){
        return res.status(400).send({
            "Status" : 400,
            "Error" : {
                "Message" : "invalid password format"
            }            
            
        })
    }
    if (!emailRegex.test(email)) {
        return res.status(400).send({
            "Status" : 400,
            "Error" : {
                "Message" : "invalid email format"
            }            
            
        })
    }
    // password and confirmation password is compared
    if(password !== confirmedPassword){
        return res.status(400).send({
            "Status" : 400,
            "Error" : {
                "Message" : "password doesnot match"
            }            
            
        })
    }
    // valid phone number check
    if(isNaN(phone)){
        return res.status(400).send({
            "Status" : 400,
            "Error" : {
                "Message" : "phone must be a number"
            }            
            
        })
    }
    return next();
}

exports.userSignUp = (req, res, next) => {
    const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@#$%^&+=!])(?!.*\s).{8,16}$/;
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    const dobRegex =     /^(?:0[1-9]|[12][0-9]|3[01])-(?:0[1-9]|1[0-2])-(?:19|20)\d\d$/;
    const email = req.body.email;
    const firstName = req.body.firstname;
    const lastName = req.body.lastname;
    const password = req.body.password;
    const confirmedPassword = req.body.confirmedpassword;
    const phone = req.body.phone;
    const dob = req.body.dob;
    // empty value check
    if(firstName === '' || 
    firstName.trim()=== ''|| 
    email === '' || 
    email.trim() === '' || 
    password === '' || 
    password.trim() === '' ||
    confirmedPassword === '' ||
    confirmedPassword.trim() === '' ||
    phone === '' || phone.trim() === ''){
        return res.status(400).send({
            "Status" : 400,
            "Error" : {
                "Message" : " empty values are spotted"
            }            
            
        })
    }
    if(!passwordRegex.test(password)){
        return res.status(400).send({
            "Status" : 400,
            "Error" : {
                "Message" : "invalid password format"
            }            
            
        })
    }
    // valid email check
    if (!emailRegex.test(email)) {
        return res.status(400).send({
            "Status" : 400,
            "Error" : {
                "Message" : "invalid email format"
            }            
            
        })
    }
    // compare password and confirmed password
    if(password !== confirmedPassword){
        return res.status(400).send({
            "Status" : 400,
            "Error" : {
                "Message" : "password doesnot match"
            }            
            
        })
    }
    // valid phone number check
    if(isNaN(phone)){
        return res.status(400).send({
            "Status" : 400,
            "Error" : {
                "Message" : "phone must be a number"
            }            
            
        })
    }
    // valid date of birth check
    if(dob !== '' || dob.trim !== ''){
        if(!dobRegex.test(dob)){
            return res.status(400).send({
                "Status" : 400,
                "Error" : {
                    "Message" : "invalid dob format"
                }            
                
            })
        }
    }
   
    return next();
    
}


exports.adminAddMovie = (req, res, next) => {
    const name = req.body.name;
    const language = req.body.language;
    const duration = req.body.duration;
    const genre = req.body.genre;
    const description = req.body.description;

    // empty value check
    if(name === '' || 
    name.trim()=== ''|| 
    language === '' || 
    language.trim() === '' || 
    duration === '' || 
    duration.trim() === '' ||
    genre === '' ||
    genre.trim() === '' ||
    description === '' || 
    description.trim() === ''){
        return res.status(400).send({
            "Status" : 400,
            "Error" : {
                "Message" : " empty values are spotted"
            }            
            
        })
    }
    // valid number check
    if(isNaN(duration)){
        return res.status(400).send({
            "Status" : 400,
            "Error" : {
                "Message" : "duration must be a number"
            }            
            
        })
    }
    // valid alphabetic string check
    if(!isNaN(language) || !isNaN(genre) || !isNaN(description)){
        return res.status(400).send({
            "Status" : 400,
            "Error" : {
                "Message" : "language , genre and description must not have number"
            }            
            
        })
    }
    return next();
}

exports.adminAddTheater = (req, res, next) => {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    const name = req.body.name;
    const location = req.body.location;
    const email = req.body.email;
    const phone = req.body.phone;

    // empty values check
    if(name === '' || 
    name.trim()=== ''|| 
    location === '' || 
    location.trim() === '' || 
    email === '' || 
    email.trim() === '' ||
    phone === '' ||
    phone.trim() === '' ){
        return res.status(400).send({
            "Status" : 400,
            "Error" : {
                "Message" : " empty values are spotted"
            }            
            
        })
    }
    // valid email check
    if (!emailRegex.test(email)) {
        return res.status(400).send({
            "Status" : 400,
            "Error" : {
                "Message" : "invalid email format"
            }            
            
        })
    }
    // valid phone number check
    if(isNaN(phone)){
        return res.status(400).send({
            "Status" : 400,
            "Error" : {
                "Message" : "phone must be a number"
            }            
            
        })
    }
    // valid location check
    if(!isNaN(location)){
        return res.status(400).send({
            "Status" : 400,
            "Error" : {
                "Message" : "location must not have a number"
            }            
            
        })
    }
    return next()
}

exports.theaterAddShow = (req, res, next) => {
    const timeRegex = /^(0?[1-9]|1[0-2]):[0-5][0-9][AP][M]$/;
    const movie = req.body.movie;
    const showtime = req.body.showtime ?? req.params.showtime;
    const price = req.body.price;
    const availableSeats = req.body.availableSeats;
    // empty value check
    if(movie === '' || 
    showtime === '' || 
    showtime.trim() === '' || 
    price === '' || 
    availableSeats === '' ){
        return res.status(400).send({
            "Status" : 400,
            "Error" : {
                "Message" : " empty values are spotted"
            }            
            
        })
    }
    // valid numeric value 
    if(isNaN(price) || isNaN(availableSeats)){
        return res.status(400).send({
            "Status" : 400,
            "Error" : {
                "Message" : "price and availableseats must be a number"
            }            
            
        })
    }
    // valid time format
    if (!timeRegex.test(showtime)) {
        return res.status(400).send({
            "Status" : 400,
            "Error" : {
                "Message" : "invalid time format, should be capital letters"
            }            
            
        })
    }
    return next()
}

exports.updatePassword = (req, res, next) => {
    const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@#$%^&+=!])(?!.*\s).{8,16}$/;
    const password = req.body.password;
    const confirmedPassword = req.body.confirmedpassword;
    // valid password check
    if(password === '' || 
    password.trim()=== ''|| 
    confirmedPassword === '' || 
    confirmedPassword.trim() === '' ){
        return res.status(400).send({
            "Status" : 400,
            "Error" : {
                "Message" : " empty values are spotted"
            }            
            
        })
    }
    if(!passwordRegex.test(password)){
        return res.status(400).send({
            "Status" : 400,
            "Error" : {
                "Message" : "invalid password format"
            }            
            
        })
    }
    if(password !== confirmedPassword){
        return res.status(400).send({
            "Status" : 400,
            "Error" : {
                "Message" : "password doesnot match"
            }            
            
        })
    }
    return next()
}

exports.editTheater = (req, res, next) => {
    const name = req.body.name;
    const location = req.body.location;
    const phone = req.body.phone;

    //valid location and phone without empty value

    if(name === '' || 
    name.trim()=== ''||
    phone === '' || 
    phone.trim()=== ''|| 
    location === '' || 
    location.trim() === '' ){
        return res.status(400).send({
            "Status" : 400,
            "Error" : {
                "Message" : " empty values are spotted"
            }            
            
        })
    }
    if(isNaN(phone)){
        return res.status(400).send({
            "Status" : 400,
            "Error" : {
                "Message" : "phone must be a number"
            }            
            
        })
    }
    if(!isNaN(location)){
        return res.status(400).send({
            "Status" : 400,
            "Error" : {
                "Message" : "location must not have a number"
            }            
            
        })
    }
    return next()
}

exports.userReview = (req, res, next) => {
    const review = req.body.review;
    // checking for empty value
    if(review === '' || 
    review.trim()=== ''){
        return res.status(400).send({
            "Status" : 400,
            "Error" : {
                "Message" : " empty values are spotted"
            }            
            
        })
    }
    return next()
}

exports.usershowValidation = (req, res, next) => {
    const timeRegex = /^(0?[1-9]|1[0-2]):[0-5][0-9][AP][M]$/;
    const tickets = req.body.tickets;
    const theater = req.body.theater;
    const showtime = req.body.showtime;
    // empty value check
    if(tickets === '' || 
    theater === '' || 
    showtime === '' || 
    showtime.trim() === '' ){
        return res.status(400).send({
            "Status" : 400,
            "Error" : {
                "Message" : " empty values are spotted"
            }            
            
        })
    }   
    // valid timeformat check
    if (!timeRegex.test(showtime)) {
        return res.status(400).send({
            "Status" : 400,
            "Error" : {
                "Message" : "invalid time format, should be capital letters"
            }            
            
        })
    }
    // valid number string check
    if(isNaN(tickets)){
        return res.status(400).send({
            "Status" : 400,
            "Error" : {
                "Message" : "tickets must be a number"
            }            
            
        })
    }
    return next()

}

exports.editUserProfileValidation = (req, res, next) =>{
    const dobRegex = /^(?:0[1-9]|[12][0-9]|3[01])-(?:0[1-9]|1[0-2])-(?:19|20)\d\d$/;
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;
    const phone = req.body.phone;
    const dob = req.body.dob;
    // check for empty values
    if(firstName === '' || 
    firstName.trim()=== ''||
    phone === '' || 
    phone.trim()=== ''){
        return res.status(400).send({
            "Status" : 400,
            "Error" : {
                "Message" : " empty values are spotted"
            }            
            
        })
    }
    if(isNaN(phone)){
        return res.status(400).send({
            "Status" : 400,
            "Error" : {
                "Message" : " phone must be a number"
            }            
            
        })
    }
    if (!dobRegex.test(dob) || dob === '' || dob.trim() === '') {
        return res.status(400).send({
            "Status" : 400,
            "Error" : {
                "Message" : "invalid dob format"
            }            
            
        })
    }
    return next()
}