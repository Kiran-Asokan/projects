const express = require('express')

const router = express.Router();

const adminController = require('../controllers/admin');
const authMiddleware = require('../middleware/authenticate');
const validation = require('../middleware/validation');
const {profileImagesUpload, moviePosterUpload} = require('../Multer/multerConfig')

// routes for getting data from database 
router.get('/movies',authMiddleware.authorize, adminController.getMovies);
router.get('/users',authMiddleware.authorize, adminController.getUsers);
router.get('/theaters',authMiddleware.authorize, adminController.getTheaters);
router.get('/movies/:moviename', authMiddleware.authorize, adminController.getMovieSearch)
router.get('/movies/location/:location', authMiddleware.authorize, adminController.getMovieSearchLocation);
router.get('/theaters/:movieId', authMiddleware.authorize, adminController.getTheatersByMovie);

// routes for creating admin account 
router.post('/signup', validation.adminSignup, adminController.postSignup);

// routes for logging into admin account 
router.post('/login',validation.adminLoginvalidation,authMiddleware.verifyAdmin, adminController.postLogin);
router.post('/logout' ,authMiddleware.authorize, adminController.postLogout);

// route for update password
router.post('/update-password', validation.updatePassword ,authMiddleware.authorize, adminController.updatePassword)

router.post('/edit-profile',profileImagesUpload.single('profileimage'),authMiddleware.authorize, adminController.editProfile)

// route for adding movies
router.post('/add-movie',moviePosterUpload.array('posters'), validation.adminAddMovie ,authMiddleware.authorize, adminController.addMovie);

// route for adding theater
router.post('/add-theater',validation.adminAddTheater,authMiddleware.authorize , adminController.addTheater);

// route for editing and deleting theater
router.post('/delete-theater/:theaterId',authMiddleware.authorize, adminController.deleteTheater)
router.post('/edit-theater/:theaterId', validation.editTheater,authMiddleware.authorize, adminController.editTheater)

// route for editing and deleting movie
router.post('/delete-movie/:movieId',authMiddleware.authorize, adminController.deleteMovie)
router.post('/edit-movie/:movieId', validation.adminAddMovie,authMiddleware.authorize , adminController.editMovie)

// route for editing and deleting user
router.post('/delete-user/:userId',authMiddleware.authorize , adminController.deleteUser)
router.post('/edit-user/:userId',authMiddleware.authorize , adminController.editUser)

// route for setting active status from user , movie and theater
router.post('/user-activity/:userId',authMiddleware.authorize ,adminController.editActivityUser)
router.post('/movie-activity/:movieId',authMiddleware.authorize ,adminController.editActivityMovie)
router.post('/theater-activity/:theaterId',authMiddleware.authorize ,adminController.editActivityTheater)

module.exports = router;