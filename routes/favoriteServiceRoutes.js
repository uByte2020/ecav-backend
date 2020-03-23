
const express                       = require('express')
const favoriteServiceController     = require('../controllers/favoriteServiceController')
const authController                = require('../controllers/authController')

const router = express.Router({ mergeParams: true});

router.use(authController.protect)

router
    .route('/MyFavourites')
    .get(favoriteServiceController.getMyFavoriteService, favoriteServiceController.getAllFavoriteService)

router
    .route('/')
    .get(authController.restrictTo(0, 1), 
        favoriteServiceController.getUserFavoriteService,
        favoriteServiceController.getAllFavoriteService)      
    .post(favoriteServiceController.addToFavorites)   
    .patch(favoriteServiceController.removeFromFavorites)   
    
router
    .route('/:id')
    .get(favoriteServiceController.getFavoriteService)
    .delete(favoriteServiceController.deleteFavoriteService)

module.exports = router;