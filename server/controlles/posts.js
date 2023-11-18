import { PostModel } from "../models/PostModel.js";

export const getPosts = async (req, res) => {
  // res.send("ROUTERS SUCCESS");
  try {
    // thêm 1 document vào db
    // const post = new PostModel({
    //   title: "test",
    //   content: "test",
    // });

    // post.save();

    //find trả về ất cả các bài viết có trong db
    const posts = await PostModel.find();
    console.log("posts:", posts);
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ coLoi: error });
  }
};

export const createPost = async (req, res) => {
  // res.send("CREATE SUCCESS!");
  try {
    //laasys data tu client
    const newPost = req.body;

    const post = new PostModel(newPost);
    post.save();

    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ coLoi: error });
  }
};

export const updatePost = async (req, res) => {
  // res.send("CREATE SUCCESS!");
  try {
    //laasys data tu client
    const updatePost = req.body;
    //data1: id nhan tu cline, data2: du lieu muon cap nhat
    const post = await new PostModel.findOneAndUpdate(
      { _id: updatePost._id },
      updatePost,
      { new: true }
    );
    post.save();

    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ coLoi: error });
  }
};
