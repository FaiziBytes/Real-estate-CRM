import jwt from "jsonwebtoken";

export const generateToken = async (id,res)=>{
      const accessToken = jwt.sign({id}, process.env.JWT_SECRET,{
            expiresIn:"1m"
      })
      const refreshToken = jwt.sign({id},process.env.REFRESH_SECRET,{
            expiresIn:"7d"
      })
}
