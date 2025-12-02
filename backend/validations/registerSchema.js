import {z} from "zod";

export const registerSchema = z.object({
      name:z.string().min(3,"name must be atleast 3 characters long"),
      email:z.string().email("invalid email format"),
      password:z.string().min(7,"password must be atleast 8 characters long")
})

export const VerifyUser = z.object({
      email:z.string().email("invalid email format"),
      password:z.string().min(7,"password must be atleast 8 characters long")
})