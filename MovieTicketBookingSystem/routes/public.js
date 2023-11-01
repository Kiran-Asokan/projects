const express = require('express')
const userController = require('../controllers/user')
const router = express.Router();

router.get('/movies',userController.getMovies);

module.exports = router