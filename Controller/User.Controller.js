import {User } from "../Models/User.Model.js";
import cloudinary from "cloudinary";
import fs from 'fs/promises';
import AppError from "../Utils/appError.js";
// const cookieOptions={
//     secure:true,
//     maxAge:7*24*60*60*1000, // 7 days
//     httpOnly:true,
// }// Here client our is unity
const registerUser=async (req,res,next)=>{
     const {name,email,password}=req.body;
    
    if( !email || !password){
        return next(new AppError(' All Filed are Required',400));// whatever next executation go 
    }
    const userExists=await User.findOne({email});
    if(userExists){
        return next(new AppError('User Already Exists',400));
    }
    const user=await User.create({
       
        email,
        password,
        avatar:{
            public_id:email,
            secure_url:'https://res.cloudinary.com/du9jzqlpt/image/upload/v1674647316/avatar_drzgxv.jpg',
        }
    });
    if(!user){
        return next(new AppError('User not exists',400));
    }
    // TODO: Upload user Picture
    if(req.file){
        try{
             const result=await  cloudinary.v2.uploader.upload(req.file.path,{
                folder:'ludoServer',
                width:250,
                height:250,
                gravity:'faces',
                crop:'fill'
             });
             //console.log(result);
             if(result){
                user.avatar.public_id=result.public_id;
                user.avatar.secure_url=result.secure_url;

                // remove file from local server
                fs.rm(`uploads/${req.file.filename}`);
             }
        }catch(e){
            return next(new AppError(e || 'file not upload,please try again',400));

        }
    }

    // user after register send a token to login 
    const token=await user.generateJWTToken();
    user.isActive=true;

    await user.save();
    
    // ToDo: get jwt token in cookie
    //const token=await  user.generateJWTToken();

    user.password=undefined;// to ensure password not send in response
    
     res.status(200).json({
        success:true,
        message:'User Registerd successfully',
        token:token,
        data:user,
    });
}

//Login 
const userLogin=async (req,res,next)=>{
    const {email,password}=req.body;
    console.log(req.body);
 
    if(  !email || !password){
        return   res.status(400).json({
            success:false,
            message:"fill all filed",
            
         })// whatever next executation go 
 }
 
 const user=await User.findOne({email}).select('+password');
 if(!user ){
     return res.status(400).json({
        success:false,
        message:"Email not register yet",
        
     })
 }
 const checkPassword=await user.comparePassword(password)
 console.log(checkPassword)
 if( checkPassword===false){
     return   res.status(400).json({
        success:false,
        message:"Password is incorrect",
        
     })
 }
 
 const token=await user.generateJWTToken();
 //console.log(token)
 user.isActive=true;
 user.lastLogin=Date.now();
 user.isVerified=true;
 await user.save();
 user.password=undefined;

 // Setting the token in the cookie with name token along with cookieOption
//  res.cookie('token', token, cookieOptions);  // we dont set a token in cokkie beacuse our client is unity
 //console.log(c);
  res.status(201).json({
     success:true,
     message:"User Login Successfully",
     token:token,
     data:user
  })
 
}

//check who is login 
const whoIsLoggedIn=async (req,res,next)=>{
    const user=await User.find({isActive:true}).select('-password -otp  -lastLogin -isVerified -createdAt -updatedAt -__v');
    if(!user){
        return next(new AppError('User not found',400));
    }
    res.status(200).json({
        success:true,
        message:'User Found',
        data:user
    })  
}

// const updateUser=(req,res,next)=>{

// }

//Random match 



export {registerUser,userLogin,whoIsLoggedIn};