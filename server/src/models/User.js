// User model schema placeholder
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const userSchema = new mongoose.Schema({

    firstName: {
        type: String,
        required: [true, 'First name is required'],
        trim: true
    },

    lastName: {
        type: String,
        required: [true, 'Last name is required'],
        trim: true
    },

    email: {
        type: String,
        required: [true, 'Email is required'],
        trim: true,
        lowercase: true,
        unique: true
    },

    password: {
        type: String,
        required: [true, 'Password is required']
    },

    role: {
        type: String,
        required: [true, 'Role is required'],
        enum: ['mentor', 'mentee', 'admin']
    }



},{timestamps:true})

userSchema.pre('save', async function (next) {
  // Only hash the password if it's new or modified (not when changing email, name, etc.)
  if (!this.isModified('password')) {
    return next();
  }
  try {
    // Generate salt and hash the password
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
