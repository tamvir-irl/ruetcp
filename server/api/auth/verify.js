import express from 'express';
import crypto from "crypto";
import fetch from 'node-fetch';
import { fileURLToPath } from 'url';
import Registration from '../../Schemas/registration.js'; // Import the Registration schema
import User from '../../Schemas/user.js';  // Import the User model
import path from 'path'
// Deriving the current directory in ES modules
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const router = express.Router();
// GET to fetch the verification token for a user
router.get('/', async (req, res) => {
  const { handle } = req.query;

  if (!handle) {
    return res.status(400).json({ message: "Handle is required" });
  }

  try {
    // Check if the user exists in the registration records
    const registeredUser = await Registration.findOne({ handle });

    if (!registeredUser) {
      return res.status(400).json({ message: "User not found in registration records." });
    }

    // If user is not verified, send the verification code
    if (!registeredUser.verified) {
      return res.status(200).json({
        verificationCode: registeredUser.verificationCode
      });
    }

    return res.status(400).json({ message: "User already verified." });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error." });
  }
});


// POST to verify and create a new user
router.post('/', async (req, res) => {
  const { handle } = req.body;

  if (!handle) {
    return res.status(400).json({ message: "Handle is required" });
  }

  try {
    // Fetch user details from Codeforces API
    const response = await fetch(`https://codeforces.com/api/user.info?handles=${handle}`);
    const data = await response.json();

    if (!data || data.status !== "OK") {
      return res.status(400).json({ message: "Invalid handle or failed to fetch data from Codeforces." });
    }

    // Check if the user exists in registration records
    const registeredUser = await Registration.findOne({ handle });

    if (!registeredUser) {
      return res.status(400).json({ message: "User not found in registration records." });
    }

    if (registeredUser.verified) {
      return res.status(400).json({ message: "User is already verified." });
    }

    // Retrieve the user's organization field
    const userOrg = data.result[0]?.organization || "";

    if (userOrg !== registeredUser.verificationCode) {
      return res.status(400).json({ message: "Organization field does not match the verification code." });
    }

    // Create new user
    const newUser = new User({
      handle,
      password: registeredUser.password,
      groupRating: data.result[0].rating,
      createdAt: registeredUser.createdAt,
      type: "PARTICIPANT",
      sessionID: crypto.randomBytes(8).toString('hex'),
    });

    // Save the new user to the database
    await newUser.save();

    // Mark the user as verified in registration records
    registeredUser.verified = true;
    await registeredUser.save();

    res.status(201).json({ message: "User verified and created successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error." });
  }
});

export default router;
