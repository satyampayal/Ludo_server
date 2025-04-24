import express from "express"
import userRouter from "./Routes/User.Route.js";
import cors from "cors";
import morgan from "morgan";
const app=express();

app.use(cors());
app.use(morgan("dev"));
// parse json data
app.use(express.json())
app.use("/api/v1/",userRouter);
export default  app;