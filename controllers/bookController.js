const books = require('../models/bookModel')

// add book
exports.addBookController = async(req,res)=>{
    console.log("Inside addBookController");
    // get book details from req body
    const {title,author, imageURL, pages , price , discountPrice , abstract , publisher , isbn , language , category} = req.body
    const uploadImages = req.files.map(item=>item.filename)
    console.log(uploadImages);
    
    const sellerMail = req.payload
    console.log(title,author, imageURL, pages , price , discountPrice , abstract , publisher , isbn , language , category,uploadImages,sellerMail);   
    // check book exist or not
    const existingBook = await books.findOne({title,sellerMail})
    // book already exist:
    if(existingBook){
        res.status(409).json("Book Already Exist..")
    }else{
        // add book
        const newBook = await books.create({title,author, imageURL, pages , price , discountPrice , abstract , publisher , isbn , language , category,uploadImages,sellerMail})
        res.status(201).json(newBook)
    }
    
}

// get latest books: get 4 books
exports.getHomeBookController = async(req,res)=>{
    console.log("getHomeBookController");
    const homeBooks = await books.find().sort({_id:-1}).limit(4)
    res.status(200).json(homeBooks)
}

// get all books : ignore books uploaded by logined user
exports.getAllBooksController = async(req,res)=>{
    console.log("getAllBooksController");
    const loginUserMail = req.payload
    const searchKey = req.query.search
    const allBooks = await books.find({sellerMail:{$ne:loginUserMail},title:{$regex:searchKey,$options:"i"}})
    res.status(200).json(allBooks)
}

// get logined user uploaded books
exports.getUserBooksController = async(req,res)=>{
    console.log("getUserBooksController");
    const loginUserMail = req.payload
    const userBooks = await books.find({sellerMail:loginUserMail})
    res.status(200).json(userBooks)
}

// get logined user purchaced books
exports.getUserBroughtBooksController = async(req,res)=>{
    console.log("getUserBroughtBooksController");
    const loginUserMail = req.payload
    const userBroughtBooks = await books.find({buyerMail:loginUserMail})
    res.status(200).json(userBroughtBooks)
}


// Delete book uploaded by logined user
exports.deleteUploadBooksController = async(req,res)=>{
    console.log("deleteUploadBooksController");
    const {id} = req.params
    const deleteBook = await books.findByIdAndDelete({_id:id})
    res.status(200).json(deleteBook)
}

// get a single book to view

exports.viewBookController = async(req,res)=>{
    console.log("viewBookController");
    const {id} = req.params
    const bookDetails = await books.findById({_id:id})
    res.status(200).json(bookDetails)
}



// get all books : admin page

// update book status: admin page

// book payment