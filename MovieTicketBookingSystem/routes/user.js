const express = require('express')

const router = express.Router();
const userController = require('../controllers/user')
const authMiddleware = require('../middleware/authenticate');
const validation = require('../middleware/validation');
const {profileImagesUpload} = require('../Multer/multerConfig')


// setting routes   

router.post('/signup', validation.userSignUp, userController.postSignup);
// login and logout routes
router.post('/login',validation.userLoginvalidation,authMiddleware.verifyUser, userController.postLogin);
router.post('/logout',authMiddleware.authorize , userController.postLogout)

// getting movies and theaters 
router.get('/movies', authMiddleware.authorize, userController.getMovies);
router.get('/theaters', authMiddleware.authorize, userController.getTheaters );

// searching for movies using keywords and location
router.get('/movies/:moviename', authMiddleware.authorize, userController.getMovieSearch);
router.get('/movies/location/:location', authMiddleware.authorize, userController.getMovieSearchLocation);
router.get('/theaters/:movieId', authMiddleware.authorize, userController.getTheatersByMovie);

// edit profile
router.post('/edit-profile',profileImagesUpload.single('profileimage'), validation.editUserProfileValidation, authMiddleware.authorize,userController.postEdit);

// send mail for password update
router.post('/sendmail', authMiddleware.authorize , userController.sendMail);

// authorizing change password
router.post('/change-password', authMiddleware.authorize, userController.authPassChange);

// update password
router.post('/update-password', validation.updatePassword,  authMiddleware.authorize ,userController.updatePassword);

// book and cancel tickets
router.post('/book-show',validation.usershowValidation , authMiddleware.authorize, userController.bookShow, userController.payment, userController.completeBooking)
router.post('/cancel-ticket/:bookingId' , authMiddleware.authorize, userController.cancelTicket, userController.refund, userController.completeCancellation)

// add, update and delete review 
router.post('/add-review', validation.userReview, authMiddleware.authorize, userController.postReview)
router.post('/delete-review/:movieId',authMiddleware.authorize, userController.deleteReview)
router.post('/update-review/:movieId', validation.userReview,authMiddleware.authorize, userController.updateReview)

module.exports = router