import tryCatch from "../middlewares/trycatch.js";

export const registerUser = tryCatch(async (req,res)=>{
      const {name,email,password} = req.body;
      res.json({
            name:name,
            email:email,
            password:password
      })
})