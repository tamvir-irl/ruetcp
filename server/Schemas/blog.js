import mongoose from "mongoose";

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 144,
    },
    content: {
      type: String,
      required: true,
    },
    author: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    initialUpvotes: {
      type: Number,
      default: 0,
    },
    initialDownvotes: {
      type: Number,
      default: 0,
    },
    upvotedBy: {
      type: [String],
      required: false,
    },
    downvotedBy: {
      type: [String],
      required: false,
    },
    edited: {
      type: Boolean,
      default: false,
    },
    editedAt: {
      type: Date,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

const Blog =
  mongoose.models.Blog || mongoose.model('Blog', blogSchema);

export default Blog;
