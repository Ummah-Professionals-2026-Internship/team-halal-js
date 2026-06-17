const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { PDFParse } = require('pdf-parse');
const mammoth = require('mammoth');
const requireAuth = require('../middleware/requireAuth');
const User = require('../models/User');

// Ensure upload directories exist
const uploadDirs = [
  path.join(__dirname, '../../uploads'),
  path.join(__dirname, '../../uploads/profile-pictures'),
  path.join(__dirname, '../../uploads/resumes')
];

uploadDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Configure Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'profilePicture') {
      cb(null, path.join(__dirname, '../../uploads/profile-pictures'));
    } else if (file.fieldname === 'resume') {
      cb(null, path.join(__dirname, '../../uploads/resumes'));
    } else {
      cb(null, path.join(__dirname, '../../uploads'));
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'profilePicture') {
      const filetypes = /jpeg|jpg|png|gif|webp/;
      const mimetype = filetypes.test(file.mimetype);
      const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
      if (mimetype && extname) {
        return cb(null, true);
      }
      return cb(new Error('Only images (jpg, jpeg, png, gif, webp) are allowed'));
    } else if (file.fieldname === 'resume') {
      const filetypes = /pdf|doc|docx|txt/;
      const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
      if (extname) {
        return cb(null, true);
      }
      return cb(new Error('Only resume files (pdf, doc, docx, txt) are allowed'));
    }
    cb(null, true);
  }
});

// Load lists from client/src/constants/lists.js for resume parsing heuristics
let universities = [];
let majors = [];

try {
  const listsPath = path.join(__dirname, '../../../client/src/constants/lists.js');
  if (fs.existsSync(listsPath)) {
    const content = fs.readFileSync(listsPath, 'utf8');
    
    // Parse UNIVERSITIES_LIST
    const universitiesMatch = content.match(/export const UNIVERSITIES_LIST = \s*\[([\s\S]*?)\];/);
    if (universitiesMatch) {
      universities = universitiesMatch[1]
        .split(',')
        .map(s => s.trim().replace(/^["']|["']$/g, '').trim())
        .filter(Boolean);
      universities.sort((a, b) => b.length - a.length);
    }

    // Parse MAJORS_LIST
    const majorsMatch = content.match(/export const MAJORS_LIST = \s*\[([\s\S]*?)\];/);
    if (majorsMatch) {
      majors = majorsMatch[1]
        .split(',')
        .map(s => s.trim().replace(/^["']|["']$/g, '').trim())
        .filter(Boolean);
      majors.sort((a, b) => b.length - a.length);
    }
  }
} catch (error) {
  console.error('Failed to pre-load lists for resume parsing:', error);
}

// Popular careers list for matching
const CAREERS_LIST = [
  "Software Engineer", "Software Developer", "Frontend Developer", "Backend Developer", "Full Stack Developer",
  "Data Scientist", "Data Analyst", "Machine Learning Engineer", "AI Engineer",
  "Product Manager", "Project Manager", "Business Analyst", "Consultant", "Strategy Consultant",
  "Financial Analyst", "Investment Banker", "Accountant", "Auditor",
  "Mechanical Engineer", "Electrical Engineer", "Civil Engineer", "Chemical Engineer",
  "UX Designer", "UI Designer", "Product Designer", "Graphic Designer",
  "Marketing Manager", "Digital Marketer", "Social Media Manager", "Brand Specialist",
  "Human Resources Generalist", "Recruiter", "Talent Acquisition",
  "Sales Representative", "Account Executive", "Business Development Representative"
];

// Helper to clean parsed text
const cleanText = (text) => {
  return text.replace(/\s+/g, ' ').trim();
};

// Heuristic matcher
const performHeuristicMatching = (text, parsedData) => {
  // 1. Match University
  for (const uni of universities) {
    const escapedUni = uni.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(`\\b${escapedUni}\\b`, 'i');
    if (regex.test(text)) {
      parsedData.university = uni;
      break;
    }
  }

  // 2. Match Major
  for (const major of majors) {
    const escapedMajor = major.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(`\\b${escapedMajor}\\b`, 'i');
    if (regex.test(text)) {
      parsedData.majors = major;
      break;
    }
  }

  // 3. Match Desired Career
  for (const career of CAREERS_LIST) {
    const escapedCareer = career.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(`\\b${escapedCareer}\\b`, 'i');
    if (regex.test(text)) {
      parsedData.desiredCareer = career;
      break;
    }
  }

  // 4. Match Phone
  const phoneMatch = text.match(/\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
  if (phoneMatch) {
    parsedData.phone = phoneMatch[0];
  }

  // 5. Match LinkedIn
  const linkedinMatch = text.match(/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[a-zA-Z0-9_-]+/i);
  if (linkedinMatch) {
    parsedData.linkedinUrl = linkedinMatch[0].startsWith('http') ? linkedinMatch[0] : 'https://' + linkedinMatch[0];
  }
};

// POST /api/upload/profile-picture
router.post('/profile-picture', requireAuth, upload.single('profilePicture'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    const relativePath = `/uploads/profile-pictures/${req.file.filename}`;

    // Clean up old profile picture from disk
    const user = await User.findById(req.user.id);
    if (user && user.profilePicture) {
      const oldPath = path.join(__dirname, '../..', user.profilePicture);
      if (fs.existsSync(oldPath)) {
        try {
          fs.unlinkSync(oldPath);
        } catch (unlinkErr) {
          console.error('Failed to delete old profile picture:', unlinkErr);
        }
      }
    }

    // Save new profile picture path to user document immediately
    if (user) {
      user.profilePicture = relativePath;
      await user.save();
    }

    res.status(200).json({ filePath: relativePath });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/upload/resume
router.post('/resume', requireAuth, upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const relativePath = `/uploads/resumes/${req.file.filename}`;
    const absolutePath = req.file.path;

    // Clean up old resume from disk
    const user = await User.findById(req.user.id);
    if (user && user.resume) {
      const oldPath = path.join(__dirname, '../..', user.resume);
      if (fs.existsSync(oldPath)) {
        try {
          fs.unlinkSync(oldPath);
        } catch (unlinkErr) {
          console.error('Failed to delete old resume:', unlinkErr);
        }
      }
    }

    // Save new resume path to user document immediately
    if (user) {
      user.resume = relativePath;
      await user.save();
    }

    const ext = path.extname(req.file.originalname).toLowerCase();
    
    let parsedText = '';
    const parsedData = {
      university: '',
      majors: '',
      desiredCareer: '',
      phone: '',
      linkedinUrl: ''
    };

    if (ext === '.pdf') {
      try {
        const dataBuffer = fs.readFileSync(absolutePath);
        const parser = new PDFParse({ data: dataBuffer });
        const data = await parser.getText();
        parsedText = cleanText(data.text);
        performHeuristicMatching(parsedText, parsedData);
      } catch (parseErr) {
        console.error('PDF parsing error:', parseErr);
      }
    } else if (ext === '.txt') {
      try {
        parsedText = fs.readFileSync(absolutePath, 'utf8');
        parsedText = cleanText(parsedText);
        performHeuristicMatching(parsedText, parsedData);
      } catch (parseErr) {
        console.error('TXT parsing error:', parseErr);
      }
    } else if (ext === '.docx') {
      try {
        const result = await mammoth.extractRawText({ path: absolutePath });
        parsedText = cleanText(result.value);
        performHeuristicMatching(parsedText, parsedData);
      } catch (parseErr) {
        console.error('DOCX parsing error:', parseErr);
      }
    } else {
      console.warn('Legacy .doc parsing is not supported. Please upload a .docx, .pdf, or .txt file for auto-fill.');
    }

    res.status(200).json({
      filePath: relativePath,
      parsedData: parsedData
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
