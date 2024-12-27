import express from 'express';
import Comment from '../../Schemas/comment.js';

const router = express.Router();

// GET all comments for a post
router.get('/:postId', async (req, res) => {
  const { postId } = req.params;

  try {
    // Fetch comments for the given post
    const comments = await Comment.find({ blog: postId })
      .populate('parentComment', 'content') // Populate only the content of the parent comment
      .sort({ createdAt: -1 }); // Sort by creation time

    res.json({ success: true, comments });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to fetch comments.' });
  }
});
router.get('/count/:postId', async (req, res) => {
    const { postId } = req.params;
  
    try {
      // Fetch comments for the given post
      const comments = await Comment.find({ blog: postId })
        .populate('parentComment', 'content') // Populate only the content of the parent comment
        .sort({ createdAt: -1 }); // Sort by creation time
  
      res.json({ success: true, total: comments.length });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: 'Failed to fetch comments.' });
    }
  });

// POST a new comment
router.post('/', async (req, res) => {
  const { author, content, blog, parentComment } = req.body;

  try {
    // Create a new comment
    const newComment = new Comment({
      author,
      content,
      blog,
      parentComment: parentComment || null, // If no parentComment, it's a top-level comment
      createdAt: new Date(),
    });

    // Save the comment to the database
    await newComment.save();

    res.status(201).json({ success: true, message: 'Comment added successfully.', comment: newComment });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to add comment.' });
  }
});

// POST a reply to a comment
router.post('/reply', async (req, res) => {
  const { author, content, blog, parentCommentId } = req.body;

  try {
    // Check if the parent comment exists
    const parentComment = await Comment.findById(parentCommentId);
    if (!parentComment) {
      return res.status(404).json({ success: false, message: 'Parent comment not found.' });
    }

    // Create a reply comment
    const replyComment = new Comment({
      author,
      content,
      blog,
      parentComment: parentComment._id, // Link to the parent comment
      createdAt: new Date(),
    });

    // Save the reply to the database
    await replyComment.save();

    const responseComment = {
      _id: replyComment._id,
      author,
      content,
      blog,
      parentComment: {
        _id: parentComment._id,
        content: parentComment.content,
      },
      createdAt: new Date(),
    }

    res.status(201).json({ success: true, message: 'Reply added successfully.', comment: responseComment });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to add reply.' });
  }
});

export default router;
