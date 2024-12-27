import express from 'express';
import crypto from 'crypto';
import fetch from 'node-fetch';
import Registration from '../../Schemas/registration.js'; // Import the Registration schema

const router = express.Router();
const generateVerificationCode = () => crypto.randomBytes(4).toString('hex');

// Registration endpoint
router.post('/', async (req, res) => {
  const { handle, password } = req.body;

  // Validate password length (minimum 6 characters)
  if (password.length < 6) {
    return res.status(400).send({ message: 'Password must be at least 6 characters long.' });
  }

  try {
    // Check if the handle already exists in the database
    const existingUser = await Registration.findOne({ handle });

    if (existingUser) {
      if (!existingUser.verified) {
        // User is registered but not verified
        return res.status(200).send({
          message: 'This handle is registered but not verified. Redirecting to verification page.',
          redirect: true,
          handle,
        });
      }

      // User is already registered and verified
      return res.status(400).send({ message: 'This Codeforces handle is already registered and verified.' });
    }

    // Validate if the handle exists on Codeforces
    const response = await fetch(`https://codeforces.com/api/user.info?handles=${handle}`);
    const apiData = await response.json();

    if (apiData.status !== 'OK') {
      return res.status(400).send({ message: 'Invalid Codeforces handle' });
    }

    const verificationCode = generateVerificationCode();

    // Create a new registration document
    const registration = new Registration({
      handle,
      password,
      verificationCode,
      createdAt: new Date(),
      verified: false,
    });

    // Save the registration document to the database
    await registration.save();

    res.send({
      message: 'Registration successful. Please verify your account.',
      handle,
    });
  } catch (error) {
    console.error('Error during registration process:', error);
    res.status(500).send({ message: 'Internal server error' });
  }
});

export default router;
