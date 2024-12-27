import mongoose from 'mongoose';

const { Schema, model, Types } = mongoose;

// Define the comment schema
const commentSchema = new Schema(
  {
    author: {
      type: String,
      ref: 'User',
      required: true, // Reference to the User schema
    },
    blog: {
      type: Types.ObjectId,
      ref: 'Blog',
      required: true, // Reference to the Blog schema
    },
    content: {
      type: String,
      required: true, // The actual comment content
      trim: true,
    },
    createdAt: {
      type: Date,
      default: Date.now, // Auto-set the creation timestamp
    },
    parentComment: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment', default: null },
  },
  {
    timestamps: true, // Automatically manage createdAt and updatedAt fields
  }
);

// Export the Comment model
const Comment = mongoose.models.Comment || mongoose.model('Comment', commentSchema);

export default Comment;
