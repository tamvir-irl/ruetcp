import express from 'express';
import Blog from '../../Schemas/blog.js';
import User from '../../Schemas/user.js'; // Assuming you have a User model
const router = express.Router();

// Profile route
router.get('/:handle', async (req, res) => {
  try {
    const { handle } = req.params;

    // Find the user by handle
    const user = await User.findOne({ handle });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // Fetch user's blogs
    const blogs = await Blog.find({ author: handle }).sort({ createdAt: -1 });
    const response = await fetch(`https://codeforces.com/api/user.info?handles=${user.handle}`);
        const apiData = await response.json();

        if (apiData.status !== 'OK') {
            return res.status(400).send({ message: 'Invalid Codeforces handle' });
        }

        const userDetails = apiData.result[0];
    const userObj = {
        firstName: userDetails.firstName,
        lastName: userDetails.lastName,
        rating: userDetails.rating,
        maxRating: userDetails.maxRating,
        handle: user.handle,
        avatarUrl: userDetails.titlePhoto || '',
        groupRating: user.groupRating, // Assuming `groupRating` exists in your schema
        type: user.type, // Assuming `type` exists in your schema
    }
    res.status(200).json({ success: true, user: userObj, blogs });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ success: false, message: 'Unable to fetch profile.' });
  }
});

export default router;
