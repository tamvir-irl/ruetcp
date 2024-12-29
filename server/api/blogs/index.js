import express from 'express';
import Blog from '../../Schemas/blog.js'; // Adjust the import path based on your directory structure

const router = express.Router();

// Route to get all blogs
router.get('/', async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 }); // Fetch blogs sorted by newest first
    res.status(200).json({ success: true, blogs });
  } catch (error) {
    console.error('Error fetching blogs:', error);
    res.status(500).json({ success: false, message: 'Unable to fetch blogs.' });
  }
});


// Route to get a specific blog by ID
router.get('/:id', async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id); // Find blog by MongoDB ObjectId

    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog not found.' });
    }

    res.status(200).json({ success: true, blog });
  } catch (error) {
    console.error('Error fetching blog:', error);
    res.status(500).json({ success: false, message: 'Unable to fetch blog.' });
  }
});

// Upvote blog
router.post('/:id/upvote', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    const blog = await Blog.findById(id);

    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog not found.' });
    }

    // Handle toggle logic
    if (blog.upvotedBy.includes(userId)) {
      blog.upvotedBy = blog.upvotedBy.filter((u) => u !== userId);
      blog.initialUpvotes -= 1;
    } else {
      blog.upvotedBy.push(userId);
      blog.initialUpvotes += 1;

      if (blog.downvotedBy.includes(userId)) {
        blog.downvotedBy = blog.downvotedBy.filter((u) => u !== userId);
        blog.initialDownvotes -= 1;
      }
    }

    await blog.save(); // Save changes to MongoDB
    res.status(200).json({ success: true, blog });
  } catch (error) {
    console.error('Error updating upvotes:', error);
    res.status(500).json({ success: false, message: 'Unable to upvote blog.' });
  }
});

// Downvote blog
router.post('/:id/downvote', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    const blog = await Blog.findById(id);

    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog not found.' });
    }

    if (blog.downvotedBy.includes(userId)) {
      blog.downvotedBy = blog.downvotedBy.filter((u) => u !== userId);
      blog.initialDownvotes -= 1;
    } else {
      blog.downvotedBy.push(userId);
      blog.initialDownvotes += 1;

      if (blog.upvotedBy.includes(userId)) {
        blog.upvotedBy = blog.upvotedBy.filter((u) => u !== userId);
        blog.initialUpvotes -= 1;
      }
    }

    await blog.save();
    res.status(200).json({ success: true, blog });
  } catch (error) {
    console.error('Error updating downvotes:', error);
    res.status(500).json({ success: false, message: 'Unable to downvote blog.' });
  }
});

// Create a new blog
router.post('/post', async (req, res) => {
  try {
    const { title, description, author } = req.body;

    if (!title || !description || !author) {
      return res.status(400).json({ success: false, message: 'Title, description, and author are required.' });
    }

    const newBlog = new Blog({
      title,
      content: description,
      author,
    });

    await newBlog.save(); // Save new blog to MongoDB

    res.status(201).json({ success: true, blog: newBlog });
  } catch (error) {
    console.error('Error creating blog:', error);
    res.status(500).json({ success: false, message: 'Unable to create blog.' });
  }
});
router.patch('/edit/:id', async (req, res) => {
  const { id } = req.params;
  const { blog } = req.body;

  if (!blog || !blog.title || !blog.content) {
    return res.status(400).json({ success: false, message: 'Invalid blog data.' });
  }

  try {
    const ublog = await Blog.findById(id);

    if (!ublog) {
      return res.status(404).json({ success: false, message: 'Blog not found.' });
    }

    ublog.title = blog.title;
    ublog.content = blog.content;
    ublog.edited = true;
    ublog.editedAt = new Date();

    await ublog.save();

    res.status(200).json({ success: true, blog: ublog });
  } catch (error) {
    console.error('Error updating blog:', error);
    res.status(500).json({ success: false, message: 'Unable to update blog.' });
  }

})

router.delete('/delete/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const blog = await Blog.findByIdAndDelete(id);

    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog not found.' });
    }

    res.status(200).json({ success: true, message: 'Blog deleted successfully.' });
  } catch (error) {
    console.error('Error deleting blog:', error);
    res.status(500).json({ success: false, message: 'Unable to delete blog.' });
  }
});

export default router;
