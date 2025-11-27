const tryCatch = (handler)=>{
      return async(req,res,next)=>{
            try {
                  await handler(req,res,next);
            } catch (error) {
                  res.status(400).json({
                        message:error.message
                  })
            }
      }
}

export default tryCatch;