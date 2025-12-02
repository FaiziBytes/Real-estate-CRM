import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/connection.js";
import Router from "./routes/user.routes.js";
import {createClient} from "redis";
dotenv.config();
await connectDB();

const redisUrl = process.env.REDIS_URL;
if(!redisUrl){
      console.log("missing redis url");
      process.exit(1);
}
export const redisClient = createClient({
      url:redisUrl
})
redisClient.connect()
.then(()=> console.log("connected to redis"))
.catch(console.error)
// our app 
const app = express();
// middlewares
app.use(express.json());
app.use("/api/v1",Router);
// app is running
app.get("/",(req,res)=>{
      res.send("server is running bro");
});
//app is listening
app.listen(process.env.PORT,()=>{
      console.log("server is running at the port ",process.env.PORT)
})