import app from "./app.js";
import { config } from "dotenv";
import connectedToDB from "./Config/db.config.js";
import { v2 } from "cloudinary";

//config dotenv
config();
v2.config({
    cloud_name:process.env.CLOUDINARY_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_API_SECRET,

});
app.listen(process.env.PORT,(err)=>{
   if(err){
    console.log(err);
    return ;
   }
   else{
    console.log("server is running on port 3000");
     connectedToDB();
   }

})