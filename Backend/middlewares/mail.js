const nodemailer=require("nodemailer")
require("dotenv").config();
const cookieParser=require("cookie-parser")
let mailfun=(req,res,next)=>{
    const {email}=req.body
    const transporter = nodemailer.createTransport({
        // host: 'smtp.ethereal.email',
        // port: 587,
        service:"gmail",
        auth: {
            user: 'singh.saurabh301199@gmail.com',
            pass: process.env.mailpass
        },
        tls: {
            rejectUnauthorized: false
        }
    });
    let p=Math.floor(Math.random() * 9000 + 1000);
    let otp=0000
    if(p<10000 || p>999){
        otp=p
    }else{
        otp=0000

    }
    // to: 'manoharmeena245@gmail.com',
    transporter.sendMail({
        to: `${email}`,
         from: 'singh.me457@gmail.com',
         subject:"Verification Mail",
         text: `your otp is ${otp}`
        //  html:"<h1>hii</h1>"
    }).then(()=>{
        console.log("mail sent successfully")
        console.log(otp)
        res.cookie("otp",otp)
        res.json(otp)
        // res.locals["otp"] =otp
        next()
      
    }).catch((err)=>{
        console.log(err)
        console.log("err in mail sent")
    })
}
module.exports ={mailfun}