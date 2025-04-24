import { Router } from "express";
import {  registerUser, userLogin, whoIsLoggedIn } from "../Controller/User.Controller.js";
import upload from "../Middleware/multer.middleware.js";
const userRouter=Router();

userRouter.post("/user/register",upload.single('avatar'),registerUser)
userRouter.post("/user/login",userLogin);
userRouter.get("/user/whoisLogin",whoIsLoggedIn);


export default userRouter;

//H.W
//addressable and asset bundle --> used to build  only not go script file we have 