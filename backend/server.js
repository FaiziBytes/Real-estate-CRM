import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import connectDB from "./config/connection.js";
import Router from "./routes/user.routes.js";
dotenv.config();
await connectDB();
// our app 
const app = express();
// middlewares
app.use(express.json());
app.use(express.urlencoded({extended:true}))
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use("/api/v1",Router);
// app is running
app.get("/",(req,res)=>{
      res.send("server is running bro");
});
//app is listening
app.listen(process.env.PORT,()=>{
      console.log("server is running at the port ",process.env.PORT)
})