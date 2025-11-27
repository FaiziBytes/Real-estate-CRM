import tryCatch from "../middlewares/trycatch.js";
import sanitize from "mongo-sanitize";
import { registerSchema } from "../validations/registerSchema.js";
export const registerUser = tryCatch(async (req, res) => {
      const sanitizedBody = sanitize(req.body);
      const validation = registerSchema.safeParse(sanitizedBody);
      if (!validation.success) {
            return res.status(400).json({
                  message: validation.error.issues[0].message
            });
      }
      const { name, email, password } = validation.data;
      res.json({
            name: name,
            email: email,
            password: password
      })
})