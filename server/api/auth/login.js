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
    const registration = await Registration.findOne({ handle });

    if (!registration) {
      return res.status(400).send({ message: 'Your account is not registered. Please register first.' });
    }
    if (!registration.verified) {
      return res.status(400).send({ message: 'Your account is not verified. Please verify first.' });
    }

    // Check if the user exists
    if (!user) {
      return res.status(400).send({ message: 'Invalid handle' });
    }
    
    // Compare the plain-text password with the hashed password
    const isPasswordCorrect = await bcrypt.compare(password, registration.password);

    if (!isPasswordCorrect) {
      return res.status(400).send({ message: 'Invalid password' });
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
