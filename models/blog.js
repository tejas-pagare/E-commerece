import mongoose from "mongoose";

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  author: {
    type: String,
    required: true
  },
  image: {
    type: String // URL or path to image
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Blog = mongoose.model("Blog", blogSchema);
export default Blog;
