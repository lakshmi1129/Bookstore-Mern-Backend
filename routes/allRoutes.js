const express = require("express")
const userController = require('../controllers/userController')
const bookController = require('../controllers/bookController')

const authMiddleware = require("../middlewares/authMiddleware")
const multerMiddleware = require("../middlewares/multerMiddleware")
const adminMiddleware = require("../middlewares/adminMiddleware")

// object for router class in express
const router = new express.Router()

// register
router.post('/register',userController.registerController)

// login
router.post('/login',userController.loginController)

// google login
router.post('/google-login',userController.googleLoginController)

// get home books
router.get('/home-books',bookController.getHomeBookController)



// -------------------------------AUTHORIZED ACCESS----------------------------------------------------

// edit User 
router.put('/user/:id',authMiddleware,multerMiddleware.single('picture'), userController.userEditController)


// Add Book 
router.post('/book',authMiddleware,multerMiddleware.array('uploadImages',3), bookController.addBookController)


// get all books
router.get('/all-books',authMiddleware,bookController.getAllBooksController)

// get user uploaded books
router.get('/user-books',authMiddleware,bookController.getUserBooksController)

// get user brought books
router.get('/brought-books',authMiddleware,bookController.getUserBroughtBooksController)

// delete user uploaded book
router.delete('/book/:id',authMiddleware,bookController.deleteUploadBooksController)


// get view book
router.get('/view-book/:id',authMiddleware,bookController.viewBookController)

// get Abstract via AI book
router.post('/book-ai',authMiddleware,bookController.generateAbstractAIController)


// book payment
router.put('/books/:id/buy',authMiddleware,bookController.bookPaymentController)


// -------------------------------AUTHORIZED ACCESS : ADMIN----------------------------------------------------

// edit admin 
router.put('/admin/:id',adminMiddleware,multerMiddleware.single('picture'), userController.userEditController)

// get all users  
router.get('/user-list',adminMiddleware,userController.getAllUsersController)


// get all Books  
router.get('/book-list',adminMiddleware,bookController.getAllBookController)

// Update Books status 
router.put('/book/:id',adminMiddleware,bookController.updateBookStatusController)




module.exports = router