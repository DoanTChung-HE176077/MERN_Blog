import express from "express";
import { getPosts, createPost, updatePost } from "../controlles/posts.js";

const router = express.Router();

//viết nhều logic code ở đây
router.get("/", getPosts);
//http:localhost:5000/posts
router.post("/", createPost);
router.post("/update", updatePost);
export default router;
