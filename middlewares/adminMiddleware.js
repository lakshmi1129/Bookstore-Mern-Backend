const jwt = require('jsonwebtoken')

const adminMiddleware =(req,res,next)=>{
    console.log("inside adminMiddleware");
    const token = req.headers['authorization'].split(" ")[1]
    // console.log(token);
    if(token){
        try{
        const jwtResponse = jwt.verify(token,process.env.JWTSECRET)
         console.log(jwtResponse);
         req.payload = jwtResponse.userMail
         const role = jwtResponse.role
         if(role=="admin"){
           next()    
         }else{
                res.status(401).json("Its not Admin....Not an Authorized user..!!!!..")
         }
        }catch(err){    
            res.status(401).json("Invalid Token.....")
        }
    }else{
        res.status(401).json("Not an Authorized user.. Token Missing!!!!..")
    }
}
module.exports = adminMiddleware