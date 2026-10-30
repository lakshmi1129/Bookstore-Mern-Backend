const books = require('../models/bookModel')
const stripe = require('stripe')(process.env.STRIPE_SK);
const {GoogleGenerativeAI} = require('@google/generative-ai')


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
exports.getAllBookController = async(req,res)=>{
    console.log("getAllBookController");
    const allBooks = await books.find()
    res.status(200).json(allBooks)
}

// update book status: admin page
exports.updateBookStatusController = async(req,res)=>{
    console.log("updateBookStatusController");
    const {id} = req.params
    const booksDetails = await books.findById({_id:id})
    booksDetails.status ="approved"
    await booksDetails.save()
    res.status(200).json(booksDetails)
}

// book payment
exports.bookPaymentController = async (req,res)=>{
    console.log("Inside bookPaymentController");
    const buyerMail = req.payload
    const {id} = req.params
    console.log(buyerMail, id);
    
    const bookDetails = await books.findById({_id:id})
    bookDetails.status = "sold"
    bookDetails.buyerMail = buyerMail
    await bookDetails.save()
    console.log(bookDetails.uploadImages);
    
    // CREATE STRIPE CHECKOUT SESSION
    const line_items =[{
        price_data : {
            currency : "usd",
            product_data : {
                name : bookDetails.title,
                description : `${bookDetails.author}, ${bookDetails.publisher}`,
                //  images : bookDetails.uploadImages,
                metadata : {
                    title:bookDetails.title, author:bookDetails.author, price:bookDetails.discountPrice
                }
            },
             unit_amount: Math.round(bookDetails.discountPrice) * 100
        },
        quantity:1
    }]
    
    const session = await stripe.checkout.sessions.create({
        success_url : "http://localhost:5173/success",
        cancel_url: "http://localhost:5173/failed",
        line_items,
        mode: 'payment',
        allowed_payment_method_types :['card'],
    })
    console.log(session);
    res.status(200).json({chekOutURL:session.url})
}

// get book Abstract using Gemini API
exports.generateAbstractAIController = async (req,res)=>{
    console.log("Inside generateAbstractAIController");
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API)
    const {title} = req.body
    const model = genAI.getGenerativeModel({
        model:"gemini-3.5-flash-lite"
    })
    const result = await model.generateContent(`Give me a short Abstract,isbn, author name of the book ${title} in json format`)
    let replay = result.response.candidates[0].content.parts[0].text;

    // Remove markdown code fences
    replay = replay.replace(/```json|```/g, "").trim();

    // Convert string into JSON
    const bookData = JSON.parse(replay);
    console.log(bookData);
    

    // Extract abstract
    const abstract = bookData.abstract;
    const author = bookData.author;
    const isbn = bookData.isbn;

    res.status(200).json({
        success: true,
        user: title,
        content: {abstract,author,isbn}
    });
    // const replay = result.response
    // console.log(replay);
    // res.status(200).json({
    //     success:true,
    //     user:title,
    //     content : replay.candidates[0].content.parts[0].text
    // })
}