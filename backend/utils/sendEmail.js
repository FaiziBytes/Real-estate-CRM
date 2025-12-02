import nodemailer, { createTransport } from "nodemailer";

const sendEmail = async ({email, subject, html})=>{
      const transport = createTransport({
            host:"smtp.gmail.com",
            port:465,
            auth:{
                  user:process.env.EMAIL_USER,
                  pass:process.env.EMAIL_PASS
            }
      })
      await transport.sendMail({
            from:"chfaizanaslam10@gmail.com",
            to:email,
            subject,
            html
      })
}

export default sendEmail;