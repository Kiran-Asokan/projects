// import required packages.....
const path = require('path')
const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const cors = require('cors');
dotenv.config();
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const mongoose = require('mongoose');
const userRoutes = require('./routes/user');
const theaterRoutes = require('./routes/theater');
const adminRoutes = require('./routes/admin');
const publiRroutes = require('./routes/public')
// const User = require('./models/user');

// const multerStorage = require('./multer/multerConfig')


// mongodb db connection details

const app = express()
// setting storage for sessions
const store = new MongoDBStore({
    uri: process.env.MONGO_CLIENT,
    collection: 'session'
})


app.use('/images', express.static(path.join(__dirname, 'images')));
app.use(cors());
// to decode urlencoded body
app.use(bodyParser.urlencoded({extended: true}))

app.use(bodyParser.json());

// setting session
app.use(
    session({
        secret: 'secret key',
        resave: false,
        saveUninitialized: false,
        store: store
        
    })
)

// setting differernt routes
app.use('/admin',adminRoutes);
app.use('/theater',theaterRoutes);
app.use('/user',userRoutes);
app.use(publiRroutes)


app.use((req, res, next) => {
    return res.status(404).send({
        "Status" : 404,
        "Error" : {
            "Message" : "Page not found "
        }            
        
    })
  });
// connecting database using mongoose
mongoose.connect(process.env.MONGO_CLIENT)
.then(result => {
    console.log('DATABASE CONNECTED');
    app.listen(process.env.PORT)
}).catch(err => {
    console.log(err);
})