import express, { request } from "express";
//cai dat cac express middleware
import bodyParser from "body-parser";
import cors from "cors";
//import post
import posts from "./routers/posts.js";
//setting va import mongo
import mongoose from "mongoose";

const app = express();
const PORT = process.env.port || 5000;
const URI =
  "mongodb+srv://chun:ajHQL18JX4eL5sBC@cluster0.lmwd1xe.mongodb.net/?retryWrites=true&w=majority";
// /useNewUrlParser: true, useUnifiedTopology: true
//pass: ajHQL18JX4eL5sBC
mongoose
  .connect(URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("============================");
    console.log("CONNECTED TO DB!!!");
    app.listen(PORT, () => {
      console.log(`Server is running on ${PORT}`);
      console.log("============================");
    });
  })
  .catch((err) => {
    console.log("err to lam", err);
  });

//de co the sd cac middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true, limit: "30mb" }));
app.use(cors());

//danh sách routers ở đây vs port 5000
app.use("/posts", posts);
//localhost:5000/posts
