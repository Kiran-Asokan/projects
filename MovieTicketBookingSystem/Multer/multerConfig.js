const multer = require('multer')

const theaterImages = multer.diskStorage({
    destination: (req, file, cb) =>{
        cb(null, 'images/theaterImages')
    },
    filename: (req, file, cb) => {
        const updatedPath = new Date().toISOString().replace(/:/g, '-');
        cb(null,  updatedPath + '-' + file.originalname)
    }
})
const profileImages = multer.diskStorage({
    destination: (req, file, cb) =>{
        cb(null, 'images/profileImages')
    },
    filename: (req, file, cb) => {
        const updatedPath = new Date().toISOString().replace(/:/g, '-');
        cb(null,  updatedPath + '-' + file.originalname)
    }
})

const moviePoster = multer.diskStorage({
    destination: (req, file, cb) =>{
        cb(null, 'images/moviePosters')
    },
    filename: (req, file, cb) => {
        const updatedPath = new Date().toISOString().replace(/:/g, '-');
        cb(null,  updatedPath + '-' + file.originalname)
    }
})

const theaterImagesUpload = multer({storage: theaterImages})
const profileImagesUpload = multer({storage: profileImages})
const moviePosterUpload = multer({storage: moviePoster})

module.exports = {
    theaterImagesUpload,
    profileImagesUpload,
    moviePosterUpload
};
