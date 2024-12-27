import express from 'express';
import bcrypt from 'bcrypt';
import Registration from '../../Schemas/registration.js'; // Import the Registration schema
import User from '../../Schemas/user.js'; // Import the User schema

const router = express.Router();

// Login endpoint
router.post('/', async (req, res) => {
  const { handle, password } = req.body;

  try {
    // Find the user with the given handle in the User collection
    const user = await User.findOne({ handle });

    // Check if the user exists
    if (!user) {
      return res.status(400).send({ message: 'Invalid handle' });
    }
    const salt = await bcrypt.genSalt(10);
    const epassword = await bcrypt.hash(password, salt);


    if (epassword === user.password) {
      return res.status(400).send({ message: 'Invalid pwd' });
    }

    // Find the corresponding registration record to check verification
    const registration = await Registration.findOne({ handle });

    // Check if the registration record exists and is verified
    if (!registration || !registration.verified) {
      return res.status(400).send({ message: 'Your account is not verified. Please verify first.' });
    }

    // Retrieve the existing sessionId from the User document
    const { sessionID } = user;

    // Send the sessionId to the client
    res.send({ message: 'Login successful!', sessionID });
  } catch (error) {
    console.error('Error during login process:', error);
    res.status(500).send({ message: 'Internal server error' });
  }
});

export default router;
