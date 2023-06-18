const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();
// const {client} =require("../services/redis-client")

const cookieParser = require("cookie-parser");
const fs = require("fs");
const { UserModel } = require("../models/user.model");

const { mailfun } = require("../middlewares/mail");
// const { json } = require('express');

const userRouter = express.Router();
userRouter.use(cookieParser());

userRouter.get("/getUsers", async (req, res) => {
  let users = await UserModel.find();
  res.json(users);
});

userRouter.post("/otp", mailfun, async (req, res) => {
  // const { name, email, pass } = req.body
  // const user = await UserModel.findOne({ email })
  // if (user) {
  //     res.json("already exists")
  // } else {
  //     res.json("otp generated")
  // }
});

userRouter.post("/signup", async (req, res) => {
  try {
    // const cotp = req.cookies.otp;
    // const ootp=res.locals.otp
    const { name, pass, email, age, gender, otp } = req.body;
    // console.log(otp)
    // console.log(req.cookies)
    const already = await UserModel.findOne({ email });
    console.log(already);
    if (already) {
      res.json("user already exists");
    } else {
      // if (true) {
      bcrypt.hash(pass, 5, async (err, hashpass) => {
        if (err) {
          res.json("error while hashing password");
        } else {
          const user = await UserModel.insertMany({
            name,
            pass: hashpass,
            email,
            age,
            gender,
          });
          // user.save()
          res.json({ msg: "registration sucessfull" });
          // console.log(user)
        }
      });
      // } else {
      //     res.json("wrong otp")
      // }
    }
  } catch (error) {
    console.log(error);
  }
});
userRouter.post("/login", async (req, res) => {
  const { pass, email } = req.body;
  const user = await UserModel.findOne({ email });
  if (!user) {
    res.json({ msg: "user does not exist" });
  } else {
    bcrypt.compare(pass, user.pass, async (err, result) => {
      if (err) {
        res.json({ msg: "wrong credential" });
      } else {
        if (result) {
          var normaltoken = jwt.sign({ userId: user._id }, process.env.normalkey, { expiresIn: "1h" });
          var refreshtoken = jwt.sign({ userId: user._id }, process.env.refreshkey, { expiresIn: "7d" });
          res.cookie("normaltoken", normaltoken, { httpOnly: true, maxAge: 1000000 }).cookie("refreshtoken", refreshtoken, { httpOnly: true, maxAge: 100000 })
          res.locals.normaltoken = normaltoken;
          console.log(user._id)
          res.json({
            msg: "logged in successfully",
            id: user._id,
            name: user.name,
          });
        } else {
          res.json({ msg: "wrong credential" });
        }
      }
    });
  }
  // res.send(user);
});
// userRouter.post("/newtoken", (req, res) => {
//     try {
//         const newtoken = req.cookies.refreshtoken
//         // console.log(newtoken)

//         if (!newtoken) {
//             res.json("no token")
//         } else {
//             jwt.verify(newtoken, process.env.refreshkey, (err, decoded) => {
//                 if (err) {
//                     res.json("invalid token")
//                 } else {

//                     var normaltoken = jwt.sign({ userId: decoded.userId }, process.env.normalkey, { expiresIn: "1h" });
//                     res.cookie("normaltoken", normaltoken, { httpOnly: true, maxAge: 1000000 }).cookie("refreshtoken", newtoken, { httpOnly: true, maxAge: 100000 })
//                     res.json("new token generated successfully")
//                 }
//             })
//         }
//     } catch (error) {
//         console.log(error)
//     }
// })
userRouter.get("/logout", (req, res) => {
  console.log("logout successfully");
  let kk = req.cookies.normaltoken;
  // console.log(req.cookies)
  let fil = fs.readFileSync("./blacklist.json", "utf-8");
  let data = JSON.parse(fil);
  //   console.log(kk)
  data.push(kk);
  fs.writeFileSync("./blacklist.json", JSON.stringify(data));

  res.clearCookie("normaltoken").clearCookie("refreshtoken");
  res.json("logout successfully");
});

userRouter.post("/otppass", mailfun, async (req, res) => {
  const { name, email, pass, role } = req.body;
  const user = await UserModel.findOne({ email });
  if (user) {
    res.json("otp generated");
  } else {
    res.json("already exists");
  }
});

userRouter.patch("/update", async (req, res) => {
  // const cotp = req.cookies.otp
  // const { Id } = req.params
  const { email, pass } = req.body;
  // const newtoken = req.cookies.normaltoken
  const data = await UserModel.findOne({ email: email });
  // const { name, pass, email } = req.body
  console.log(pass);
  // console.log(otp, cotp)
  try {
    // if (cotp != otp) {
    //     res.json("wrong otp")
    // }
    // else if (cotp == otp) {
    // /////////////////////////////////////////////////////////////////////////////////////////////////////
    bcrypt.hash(pass, 5, async (err, hashpass) => {
      if (err) {
        // res.json("error while hashing password")
        res.json(err);
        console.log(err);
      } else {
        let noteData = await UserModel.findByIdAndUpdate(
          { _id: data._id },
          { pass: hashpass }
        );
        console.log(noteData);
        res.json("password updated");
      }
    });
    ////////////////////////////////////////////////////////////////////////////
    // }
  } catch (error) {
    console.log(error);
    console.log("something went wrong");
  }
});
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// userRouter.get('/logout', (req, res) => {

//       let kk = req.cookies.normaltoken
//       client.LPUSH("blacktok",kk)
//       res.send("logout successfully")
//       console.log("logout successfully")
// })
module.exports = { userRouter };
