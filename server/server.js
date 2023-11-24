import express from "express";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { nanoid } from "nanoid";
import jwt from "jsonwebtoken";
import "dotenv/config";
import cors from "cors";
// Import User schema from external file
import User from "./Schema/User.js";

const server = express();
let PORT = 3000;
let emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
let passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/;

server.use(express.json());
server.use(cors());

// Connect to MongoDB
mongoose.connect(process.env.DB_LOCATION, { autoIndex: true });

// Function to format user data for sending as a response
const formatDataToSend = (user) => {
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

// Function to generate a unique username based on email
const generateUsername = async (email) => {
  let isEmailNotUnique = await User.exists({ "personal_info.email": email });
  console.log("======= Checking ========");
  if (isEmailNotUnique) {
    console.log(`Email '${email}' already exists. Username not generated.`);
    return null;
  }

  let username = email.split("@")[0];

  let isUsernameNotUnique = await User.exists({
    "personal_info.username": username,
  });

  if (isUsernameNotUnique) {
    console.log("Mail is not exist in system");
    console.log(
      `Username '${username}' already exists. Create new user. Must re-name.`
    );
    username += "_" + nanoid().substring(0, 5);
  } else {
    console.log(
      `Username '${username}' is unique. Create new user. Do not re-name`
    );
  }

  return username;
};

// Signup endpoint
server.post("/signup", (req, res) => {
  let { fullname, email, password } = req.body;

  // Validate data from the frontend
  if (fullname.length < 3) {
    return res
      .status(403)
      .json({ error: "Full name must be at least three letters long." });
  }

  if (!email.length || !emailRegex.test(email)) {
    return res.status(403).json({ error: "Invalid email format." });
  }

  if (!passwordRegex.test(password)) {
    return res.status(403).json({
      error:
        "Password must be 6-20 characters long with a numeric, one lowercase, and one uppercase letter.",
    });
  }

  // Hash the password
  bcrypt.hash(password, 10, async (err, hashed_password) => {
    if (err) {
      return res.status(500).json({ error: "Error hashing password." });
    }

    let username = await generateUsername(email);

    // Create a user from the User schema
    let user = new User({
      personal_info: {
        fullname,
        email,
        password: hashed_password,
        username,
      },
    });

    // Save the user to the database
    user
      .save()
      .then((u) => {
        return res.status(200).json(formatDataToSend(u));
      })
      .catch((err) => {
        if (err.code == 11000) {
          return res.status(500).json({ error: "Email already exists." });
        }
        return res.status(500).json({ error: err.message });
      });
  });
});

// Signin endpoint
server.post("/signin", (req, res) => {
  let { email, password } = req.body;

  // Find a user by email
  User.findOne({ "personal_info.email": email })
    .then((user) => {
      if (!user) {
        return res.status(403).json({ error: "Email not found." });
      }

      // Compare the provided password with the hashed password
      bcrypt.compare(password, user.personal_info.password, (err, result) => {
        if (err) {
          return res.status(403).json({
            error: "Error occurred while logging in. Please try again.",
          });
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
      return res.status(500).json({ error: "Internal server error." });
    });
});

// Start the server
server.listen(PORT, () => {
  console.log("Server listening on port " + PORT);
});
