
import jwt from 'jsonwebtoken';
import AppError from '../Utils/appError';
 export const isLoggedIn= async function(req,res,next){
    // console.log(req.cookies);
    const {token}=req.cookies;
     console.log("IsLoggedin Token"+token)
    if(!token){
        return next(new AppError('UnAuthorised ,You should be Login First',401));
    }

    const tokenDetails= await jwt.verify(token,process.env.JWT_SECRET);

    if(!tokenDetails){
        return next(new AppError('UnAuthorised ,Please Login',401));
        
    }
    req.user=tokenDetails;
    next();
}







