import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

// Define the schema for the registration collection
const registrationSchema = new mongoose.Schema(
  {
    handle: { type: String, required: true, unique: true }, // Unique handle for user identification
    password: { type: String, required: true }, // Hashed user's password
    verificationCode: { type: String, required: true }, // Temporary verification code
    verified: { type: Boolean, default: false }, // Whether the user has been verified
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

// Hash the password before saving to the database
registrationSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next(); // Only hash if the password is new or modified
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Create and export the Registration model
const Registration =
  mongoose.models.Registration || mongoose.model('Registration', registrationSchema);

export default Registration;
