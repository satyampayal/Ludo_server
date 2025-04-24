import mongoose from "mongoose";

mongoose.set('strictQuery',false); // if Req filed not persent or empty not give error
const connectedToDB=async ()=>{
    try{
        const {connection}=await mongoose.connect(process.env.MONGO_URL);
        if(connection){
            console.log('Db Connected Successfully established');
        }
    } catch(e){
        console.log(e);
        process.exit(1);
    }

}

export default connectedToDB;