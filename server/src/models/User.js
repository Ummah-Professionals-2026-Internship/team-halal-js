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
    additionalInfo: {type: String},
    hasCompletedProfile: {type: Boolean},
    linkedinUrl: {type: String},
    university: {type: String},
    majors: [{type: String}],
    calendarAccess: { type: Boolean, default: false },

    //availabilty is an array slots with each slot being at a certain day, and starting and ending at a certain time
    availabilitySlots: [{
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
        frequency: String
    },

    menteeProfile: {
        academicStatus: String,
        desiredCareer: String,
        resume: String //will eventually make it a file not a string
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

module.exports = mongoose.model('User', userSchema);
