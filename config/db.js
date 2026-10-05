const mongoose = require('mongoose')
const connectionString = process.env.DBCONNECTIONSTRING

mongoose.connect(connectionString).then(res=>{
    console.log("Database Connection Successfull"); 
}).catch(error=>{
    console.log("Database Connection failed");
    console.log(error);   
})