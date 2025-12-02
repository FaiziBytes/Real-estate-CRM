import bcrypt from "bcrypt";
import crypto from "crypto";
import sanitize from "mongo-sanitize";
import { redisClient } from "../server.js";
import UserModel from "../models/user.model.js";
import { registerSchema,VerifyUser } from "../validations/registerSchema.js";
import sendEmail from "../utils/sendEmail.js";
import { getOtpHtml, getVerifyEmailHtml } from "../utils/html.js";
import tryCatch from "../middlewares/trycatch.js";

export const registerUser = tryCatch(async (req, res) => {
    const sanitizedBody = sanitize(req.body);
    const validation = registerSchema.safeParse(sanitizedBody);
    if (!validation.success) {
        return res.status(400).json({
            message: validation.error.issues[0].message
        });
    }
    const { name, email, password } = validation.data;
    const rateLimitKey = `register-rate-limit${req.ip}:${email}`;
    if (await redisClient.get(rateLimitKey)) {
        return res.status(429).json({
            message: "too many requests, try again later"
        })
    }
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
        return res.status(400).json({
            message: "User already exists"
        })
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const verifyToken = crypto.randomBytes(32).toString("hex");
    const verifyKey = `verify:${verifyToken}`;
    const dataToStore = JSON.stringify({
        name,
        email,
        password: hashedPassword,
    });
    await redisClient.set(verifyKey, dataToStore, { EX: 300 });
    const subject = "Verify your email address";
    const html = getVerifyEmailHtml({ email, token: verifyToken });
    await sendEmail({ email, subject, html })
    await redisClient.set(rateLimitKey, "true", { EX: 60 });
    res.json({
        message: "If the email is valid please verify the email.it will expire in 5 minutes"
    })
})

export const verifyUser = tryCatch(async (req, res) => {
    const { token } = req.params;

    if (!token) {
        return res.status(400).json({
            message: "Verification token is missing"
        });
    }

    const verifyKey = `verify:${token}`; // fixed key
    const userDataJson = await redisClient.get(verifyKey); // added await

    if (!userDataJson) {
        return res.status(400).json({
            message: "Invalid or expired verification token"
        });
    }

    await redisClient.del(verifyKey);

    const userData = JSON.parse(userDataJson);

    const existingUser = await UserModel.findOne({ email: userData.email });

    if (existingUser) {
        return res.status(400).json({
            message: "User already exists"
        });
    }
    console.log(userData);
    const newUser = new UserModel({
        name: userData.name,
        email: userData.email,
        password: userData.password
    });
    await newUser.save();
    res.status(201).json({
        message: "Email verified successfully",
        user: { id: newUser._id, name: newUser.name, email: newUser.email }
    });
});

export const LoginUser = tryCatch(async (req, res) => {
    const sanitizedBody = sanitize(req.body);
    const validation = VerifyUser.safeParse(sanitizedBody);
    if (!validation.success) {
        return res.status(400).json({
            message: validation.error.issues[0].message
        });
    }
    const { email, password } = validation.data;
    const rateLimitKey = `login-rate-limit${req.ip}:${email}`;
    if (await redisClient.get(rateLimitKey)) {
        return res.status(429).json({
            message: "too many requests, try again later"
        })
    }
    const existingUser = await UserModel.findOne({ email });
    if(!existingUser){
        return res.status(400).json({
            message:"Invalid credentials"
        })
    }
    const comparePassword = await bcrypt.compare(password,existingUser.password);
    if(!comparePassword){
        res.status(400).json({
            message:"Invalid credentials"
        })
    }
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpKey = `opt:${email}`;
    await redisClient.set(otpKey, JSON.stringify(otp),{
        EX:300
    });
    const subject = "Otp for verification";
    const html = getOtpHtml({email,otp});
    await sendEmail({email,subject,html});
    await redisClient.set(rateLimitKey,"true",{
        EX:60
    });
    res.json({
        message:"if your email is valid, an otp has been sent, it will be valid for 5 minutes"
    })
})

export const verifyOtp = tryCatch(async (req,res)=>{
    const {email,otp} = req.body;
    if(!email || otp){
        return res.status(400).json({
            message:"Please provide all the details"
        })
    }
    const otpKey = `otp:${email}`;
    const storedOtpString = await redisClient.get(otpKey);
    if(!storedOtpString){
        return res.status(400).json({
            message:"Otp expired"
        })
    }
    const storedOtp = JSON.parse(storedOtpString);
    if(storedOtp === !otp){
        return res.status({
            message:"Invalid Otp"
        })
    }
    await redisClient.del(otpKey);
    let user = await UserModel.findOne({email});
    
})