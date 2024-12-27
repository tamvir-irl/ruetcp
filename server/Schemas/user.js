import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

// Define the schema for the registration collection
const userSchema = new mongoose.Schema(
  {
    handle: { type: String, required: true, unique: true }, // Unique user handle
    password: { type: String, required: true }, // Hashed password
    groupRating: { type: Number, required: true }, // User's group rating or score
    createdAt: { type: Date, default: Date.now }, // Date of registration
    type: { 
      type: String, 
      enum: ['PARTICIPANT', 'MANAGER' , 'ADMIN'], // Restrict values
      default: 'PARTICIPANT' 
    }, 
    sessionID: { type: String, unique: true }, // Active session ID (optional)
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt
  }
);

// Hash the password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Create and export the User model
const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;
