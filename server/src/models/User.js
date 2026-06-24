// User model schema placeholder
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
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

    timeZone: {
        type: String,
    },

    state: {
        type: String,
        enum: ['AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 
            'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 
            'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 
            'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 
            'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'] 
    },

    role: {
        type: String,
        required: [true, 'Role is required'],
        enum: ['mentor', 'mentee', 'admin']
    },

    gender: {
        type: String,
        enum: ['male', 'female'],
    },

    phone: {type: String},
    referralSource: {type: String},
    profilePicture: {type: String},
    resume: {type: String},
    additionalInfo: {type: String},
    hasCompletedProfile: {type: Boolean},
    matchStatus: { type: String, enum: ['unmatched', 'matched'], default: 'unmatched' },
    linkedinUrl: {type: String},
    university: {type: String},
    majors: [{type: String}],

    calendarAccess: { type: Boolean, default: false },
    googleCalendarTokens: {
        accessToken: String,
        refreshToken: String,
        expiryDate: Number,
        email: String
    },
    calendarBusySlots: [{
        day: String,
        start: Date,
        end: Date
    }],
    //availabilty is an array slots with each slot being at a certain day, and starting and ending at a certain time
    manualAvailabilitySlots: [{
        day: String,
        startTime: String,
        endTime: String
    }],
    manualBlockedSlots: [{
        day: String,
        startTime: String,
        endTime: String
    }],

    mentorProfile: {
        jobTitle: String,
        employer: String,
        industry: String,
        yearsOfProfExp: Number,
        maxMentees: Number,
        frequency: String,
        volunteeringFor: { type: [String], enum: ['healthcare service', 'mentorship program', 'resume review', 'mock interview', 'general career advice']}
    },

    menteeProfile: {
        academicStatus: String,
        desiredCareer: String,
        desiredServices: {type: [String], enum: ['healthcare service', 'mentorship program', 'general career advice', 'resume review', 'interview prep']}
    }
},{timestamps:true})

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Hook to clean up files when user document is deleted via user.deleteOne()
userSchema.pre('deleteOne', { document: true, query: false }, async function (next) {
  try {
    if (this.profilePicture) {
      const picPath = path.join(__dirname, '../..', this.profilePicture);
      if (fs.existsSync(picPath)) {
        fs.unlinkSync(picPath);
      }
    }
    if (this.resume) {
      const resumePath = path.join(__dirname, '../..', this.resume);
      if (fs.existsSync(resumePath)) {
        fs.unlinkSync(resumePath);
      }
    }
    next();
  } catch (err) {
    console.error('Error during user pre-deleteOne hook file cleanup:', err);
    next(err);
  }
});

// Hook to clean up files when user document is deleted via queries (like findByIdAndDelete)
userSchema.pre('findOneAndDelete', async function (next) {
  try {
    const docToDelete = await this.model.findOne(this.getQuery());
    if (docToDelete) {
      if (docToDelete.profilePicture) {
        const picPath = path.join(__dirname, '../..', docToDelete.profilePicture);
        if (fs.existsSync(picPath)) {
          fs.unlinkSync(picPath);
        }
      }
      if (docToDelete.resume) {
        const resumePath = path.join(__dirname, '../..', docToDelete.resume);
        if (fs.existsSync(resumePath)) {
          fs.unlinkSync(resumePath);
        }
      }
    }
    next();
  } catch (err) {
    console.error('Error during user pre-findOneAndDelete hook file cleanup:', err);
    next(err);
  }
});

module.exports = mongoose.model('User', userSchema);
