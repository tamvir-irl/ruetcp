import express from 'express';
import fetch from 'node-fetch';
import User from '../../Schemas/user.js';  // Import the User schema

const router = express.Router();

// Get user details by session ID
router.get('/', async (req, res) => {
    const { sessionID } = req.query;

    if (!sessionID) {
        return res.status(400).send({ message: 'Session ID is required.' });
    }

    try {
        // Find the user by sessionID in the database
        const user = await User.findOne({ sessionID });

        if (!user) {
            return res.status(404).send({ message: 'User not found.' });
        }

        // Fetch user information from Codeforces API
        const response = await fetch(`https://codeforces.com/api/user.info?handles=${user.handle}`);
        const apiData = await response.json();

        if (apiData.status !== 'OK') {
            return res.status(400).send({ message: 'Invalid Codeforces handle' });
        }

        const userDetails = apiData.result[0];

        // Send user data
        res.send({
            handle: user.handle,
            avatarUrl: userDetails.titlePhoto || '',
            groupRating: user.groupRating, // Assuming `groupRating` exists in your schema
            type: user.type, // Assuming `type` exists in your schema
        });
    } catch (error) {
        console.error('Error retrieving user:', error);
        res.status(500).send({ message: 'Internal server error.' });
    }
});

export default router;
