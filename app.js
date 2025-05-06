import express from "express"
import userRouter from "./Routes/User.Route.js";
import cors from "cors";
import morgan from "morgan";
import socketRouter from "./Socket.js";
const app=express();








//end we socket
app.use(cors());
app.use(morgan("dev"));
// parse json data
app.use(express.json())
app.use("/api/v1/",userRouter);
// app.use('/',socketRouter);
export default  app;