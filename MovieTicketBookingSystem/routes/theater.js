const express = require('express')

const router = express.Router();
const theaterController = require('../controllers/theater')
const authMiddleware = require('../middleware/authenticate')
const validation = require('../middleware/validation');
const {theaterImagesUpload} = require('../Multer/multerConfig')
// setting routes 

// updating password
router.post('/update-password', validation.updatePassword , authMiddleware.authorize, theaterController.updatePassword);

// get all movies and shows
router.get('/movies', authMiddleware.authorize , theaterController.getMovies );
router.get('/shows', authMiddleware.authorize , theaterController.getShows)
router.get('/movies/:moviename', authMiddleware.authorize, theaterController.getMovieSearch)

// add , update and delete  moviw show
router.post('/add-show', validation.theaterAddShow, authMiddleware.authorize, theaterController.addShows);
router.post('/delete-show/:showtime' , authMiddleware.authorize, theaterController.deleteShow);
router.post('/update-show/:showtime', validation.theaterAddShow, authMiddleware.authorize, theaterController.updateShow)

// log in to the theater account
router.post('/login', validation.theaterLoginvalidation,authMiddleware.verifyTheater, theaterController.postLogin);
router.post('/logout', authMiddleware.authorize, theaterController.postLogout);


router.post('add-images', theaterImagesUpload.array('theaterimages') ,authMiddleware.authorize, theaterController.uploadImages)
module.exports = router;