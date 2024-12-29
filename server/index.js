import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();



import blogsRouter from './api/blogs/index.js';
import registrationRouter from './api/auth/register.js';
import verifyRouter from './api/auth/verify.js';
import loginRouter from './api/auth/login.js';
import userRouter from './api/auth/user.js';
import profileRouter from './api/profile/index.js';
import contestRouter from './api/contest/index.js';
import Contest from './Schemas/contest.js';
import commentsRouter from './api/comment/index.js';




import cron from "node-cron";
import cors from 'cors';
import User from './Schemas/user.js';
import Blog from './Schemas/blog.js';
import fetch from 'node-fetch';  // Make sure to install node-fetch if not already installed

const app = express();
const PORT = 8080;

// MongoDB connection URL
const MONGO_URI = process.env.MONGO_URI; // Replace with your actual MongoDB URI

// Connect to MongoDB
mongoose
  .connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(async () => {
    console.log('Connected to MongoDB');
    try {
      const result = await Blog.updateMany(
        { edited: { $exists: false } },
        { $set: { edited: false, editedAt: null } }
      );
      console.log(`Migration completed: ${result.modifiedCount} documents updated.`);
    } catch (error) {
      console.error('Error during migration:', error);
    }
    
    // Cron job to update contest phase every minute
    cron.schedule('* * * * *', async () => {
      const now = new Date();
    
      // Find all contests and update their phase based on the current time
      const contests = await Contest.find();
    
      contests.forEach(async (contest) => {
        let updatedPhase;
    
        if (now < contest.startTime) {
          updatedPhase = "BEFORE";  // Contest hasn't started yet
        } else if (now >= contest.startTime && now <= contest.endTime) {
          updatedPhase = "RUNNING";  // Contest is ongoing
        } else if (now > contest.endTime) {
          updatedPhase = "FINISHED";  // Contest has finished
        }
    
        // Update the contest phase if it has changed
        if (contest.phase !== updatedPhase) {
          contest.phase = updatedPhase;
          await contest.save();
          console.log(`Updated contest "${contest.contestName}" phase to ${updatedPhase}`);
        }
      });
    });

    // Cron job to update users' groupRating from Codeforces every 5 hours
    cron.schedule('0 */1 * * *', async () => {
      try {
        const users = await User.find(); // Fetch all users from MongoDB

        // Iterate over each user and fetch their rating from Codeforces API
        for (const user of users) {
          const handle = user.handle;
          const url = `https://codeforces.com/api/user.info?handles=${handle}`;
          
          try {
            const response = await fetch(url);
            const data = await response.json();

            if (data.status === 'OK' && data.result && data.result.length > 0) {
              const rating = data.result[0].rating; // Extract the rating from the response
              user.groupRating = rating; // Update groupRating with the fetched rating
              await user.save(); // Save the user document with the updated rating
              console.log(`Updated ${handle}'s groupRating to ${rating}`);
            } else {
              console.error(`Failed to fetch data for user ${handle}`);
            }
          } catch (error) {
            console.error(`Error fetching data for ${handle}:`, error);
          }
        }
      } catch (error) {
        console.error('Error fetching users or updating ratings:', error);
      }
    });
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error.message);
    process.exit(1); // Exit the app if the connection fails
  });

// Middleware
app.use(cors());
app.use(express.json());

// Serve API routes
app.use('/api/blogs', blogsRouter);
app.use('/api/register', registrationRouter);
app.use('/api/verify', verifyRouter);
app.use('/api/login', loginRouter);
app.use('/api/user', userRouter);
app.use('/api/profile', profileRouter);
app.use('/api/contest', contestRouter);
app.use('/api/comments', commentsRouter);
// Root route
app.get('/', (req, res) => {
  res.send('Hello World!');
});
app.get('/api/searchUser', async (req, res) => {
  const searchQuery = req.query.q.toLowerCase();

  try {
    // Find users with a username that contains the search query, case-insensitive
    const users = await User.find({
      handle: { $regex: searchQuery, $options: 'i' }, // Case-insensitive search
    }).limit(5); // Limit to top 5 matches

    // Send the result as an array of usernames
    // Convert every user to {username: user.handle}
    const usernames = users.map((user) => ({ username: user.handle }));
    res.json(usernames);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'An error occurred while searching for users.' });
  }
});
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find({}); // Limit to top 5 matches
    const usernames = users.map((user) => ({ username: user.handle, groupRating: user.groupRating }));
    res.json(usernames);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'An error occurred while searching for users.' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Internal Server Error' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
