import express from "express";
import { registerUser, verifyUser,LoginUser, verifyOtp } from "../controllers/user.controller.js";
const Router = express.Router();
Router.post("/register",registerUser)
Router.post("/verify/:token",verifyUser);
Router.post("/login",LoginUser)
Router.post("/verify", verifyOtp)
export default Router;