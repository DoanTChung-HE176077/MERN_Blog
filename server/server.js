import express from "express";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { nanoid } from "nanoid";
import jwt from "jsonwebtoken";
import "dotenv/config";

//Schema below, chu y them .js
import User from "./Schema/User.js";

const server = express();
let PORT = 3000;

let emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/; // regex for email
let passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/; // regex for password

//gọi json ra đẻ bên dưới còn đọc được req.body
//không gọi ra là bên dưới trả về undefined
//accept json data from front end
server.use(express.json());

//connect to mongodb
mongoose.connect(process.env.DB_LOCATION, {
  autoIndex: true,
});

const formatDataToSend = (user) => {
  //jwt, convert object user to hash string
  //cái id ở đây là cái _id ở trên mongodba áy
  const access_token = jwt.sign(
    { id: user._id },
    process.env.SECRET_ACCESS_KEY
  );

  return {
    access_token,
    profile_img: user.personal_info.profile_img,
    username: user.personal_info.username,
    fullname: user.personal_info.fullname,
  };
};

const generateUsername = async (email) => {
  // Kiểm tra sự tồn tại của email trong hệ thống
  let isEmailNotUnique = await User.exists({ "personal_info.email": email });

  // Trường hợp số 1: Email đã tồn tại
  if (isEmailNotUnique) {
    console.log(
      `Trường hợp số 1: Email '${email}' already exists. Username not generated.`
    );
    return null; // hoặc return một giá trị thích hợp tùy vào yêu cầu của bạn
  }

  // Nếu email chưa tồn tại, tạo username từ phần trước ký tự '@'
  let username = email.split("@")[0];

  // Kiểm tra sự duy nhất của username trong cơ sở dữ liệu
  let isUsernameNotUnique = await User.exists({
    "personal_info.username": username,
  });

  // Trường hợp số 2: Username đã tồn tại
  if (isUsernameNotUnique) {
    console.log(
      `Trường hợp số 2: Username '${username}' already exists. Adding nanoid.`
    );
    username += "_" + nanoid().substring(0, 5);
  } else {
    // Trường hợp số 3: Username là duy nhất
    console.log(`Trường hợp số 3: Username '${username}' is unique.`);
  }

  // Trả về username (đã thêm nanoid nếu cần)
  return username;
};

server.post("/signup", (req, res) => {
  //1. define what receive from FE
  let { fullname, email, password } = req.body;
  //2.validate data from front end
  if (fullname.length < 3) {
    return res
      .status(403)
      .json({ error: "Full name must be at least three letters long." });
  }
  if (!email.length) {
    return res.status(403).json({ error: "Must enter Mail." });
  }
  if (!emailRegex.test(email)) {
    return res.status(403).json({ error: "Invail Mail." });
  }
  if (!passwordRegex.test(password)) {
    res.status(403).json({
      error:
        "Password must be 6-20 characters long with a numberic, 1 lowercase and 1 uppercase letter.",
    });
  }
  //hash code password
  bcrypt.hash(password, 10, async (err, hashed_password) => {
    let username = await generateUsername(email);
    //create a user from Schema/User.js
    let user = new User({
      personal_info: { fullname, email, password: hashed_password, username },
    });
    user
      .save()
      .then((u) => {
        return res.status(200).json(formatDataToSend(u));
      })
      .catch((err) => {
        //duplicate in mongoo -> return error code: 11000
        if (err.code == 11000) {
          return res.status(500).json({ error: "Your email already exist!!" });
        }
        return res.status(500).json({ error: err.message });
      });
  });
});

server.post("/signin", (req, res) => {
  let { email, password } = req.body;
  User.findOne({ "personal_info.email": email }) //using findOne method by mongoo
    .then((user) => {
      if (!user) {
        return res.status(403).json({ error: "Email not found man!" });
        //throw "error"; = return res.status(403).json({ error: "Email not found man!" });
      }

      //use bcrypt again
      bcrypt.compare(password, user.personal_info.password, (err, result) => {
        if (err) {
          return res
            .status(403)
            .json({ error: "Error occured while login, please try again" });
        }
        if (!result) {
          return res.status(403).json({ error: "Incorrect password." });
        } else {
          return res.status(200).json(formatDataToSend(user));
        }
      });
    })
    .catch((err) => {
      console.log(err.message);
      return res.status(500).json({ error: err.message });
    });
});

server.listen(PORT, () => {
  console.log("listening on port --> " + PORT);
});
