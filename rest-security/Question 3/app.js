const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const bcrypt = require('bcrypt');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const xss = require('xss');
const validator = require('validator');
const multer = require('multer');
const crypto = require('crypto');

const app = express();
app.use(express.json());

// ---------------- DATABASE ----------------
mongoose.connect('mongodb://127.0.0.1:27017/edulearn');

// ---------------- MODELS ----------------
const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  role: { type: String, enum: ['student', 'instructor', 'admin'] },
  mfaSecret: String
});

const courseSchema = new mongoose.Schema({
  title: String,
  description: String,
  instructorId: String
});

const quizSchema = new mongoose.Schema({
  question: String,
  answer: String,
  studentId: String,
  submitted: Boolean
});

const User = mongoose.model('User', userSchema);
const Course = mongoose.model('Course', courseSchema);
const Quiz = mongoose.model('Quiz', quizSchema);

// ---------------- HELMET ----------------
app.use(helmet());

app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "https://analytics.com"],
    imgSrc: ["'self'", "https://s3.amazonaws.com"],
    mediaSrc: ["https://s3.amazonaws.com"],
    connectSrc: ["'self'", "https://api.stripe.com"],
    frameSrc: ["https://www.youtube.com"],
    styleSrc: ["'self'", "'unsafe-inline'"]
  }
}));

// ---------------- SESSION ----------------
app.use(session({
  secret: 'secure-secret',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: 'mongodb://127.0.0.1:27017/edulearn'
  }),
  cookie: {
    maxAge: 1000 * 60 * 30,
    httpOnly: true
  }
}));

// ---------------- RATE LIMIT ----------------
const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 5 });
const quizLimiter = rateLimit({ windowMs: 1 * 60 * 1000, max: 10 });

app.use('/login', loginLimiter);
app.use('/quiz', quizLimiter);

// ---------------- SANITIZATION ----------------
const safeHTML = new xss.FilterXSS({
  whiteList: {
    b: [], i: [], strong: [], p: [], a: ['href']
  }
});

// ---------------- AUTH ----------------
app.post('/register', async (req, res) => {
  let { email, password, role } = req.body;

  if (!validator.isEmail(email)) {
    return res.status(400).json({ error: "Invalid email" });
  }

  if (!validator.isStrongPassword(password)) {
    return res.status(400).json({ error: "Weak password" });
  }

  const hashed = await bcrypt.hash(password, 10);

  const user = new User({
    email,
    password: hashed,
    role,
    mfaSecret: crypto.randomBytes(6).toString('hex') // simple MFA secret
  });

  await user.save();
  res.json({ message: "Registered" });
});

app.post('/login', async (req, res) => {
  const { email, password, mfaCode } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ error: "Invalid" });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(401).json({ error: "Invalid" });

  // MFA for instructors
  if (user.role === 'instructor') {
    if (mfaCode !== user.mfaSecret.slice(0, 6)) {
      return res.status(403).json({ error: "Invalid MFA" });
    }
  }

  req.session.user = user;
  res.json({ message: "Login success" });
});

// ---------------- ROLE MIDDLEWARE ----------------
function requireRole(role) {
  return (req, res, next) => {
    if (!req.session.user || req.session.user.role !== role) {
      return res.status(403).json({ error: "Forbidden" });
    }
    next();
  };
}

// ---------------- COURSE ----------------
app.post('/course', requireRole('instructor'), async (req, res) => {
  let { title, description } = req.body;

  description = safeHTML.process(description);

  const course = new Course({
    title,
    description,
    instructorId: req.session.user._id
  });

  await course.save();
  res.json({ message: "Course created" });
});

// ---------------- QUIZ ----------------
app.post('/quiz', async (req, res) => {
  let { question, answer } = req.body;

  question = xss(question);
  answer = xss(answer);

  const quiz = new Quiz({
    question,
    answer,
    studentId: req.session.user._id,
    submitted: true
  });

  await quiz.save();
  res.json({ message: "Submitted" });
});

// Prevent modification
app.put('/quiz/:id', async (req, res) => {
  const quiz = await Quiz.findById(req.params.id);

  if (quiz.submitted) {
    return res.status(403).json({ error: "Cannot modify submitted quiz" });
  }
});

// ---------------- FILE UPLOAD ----------------
const upload = multer({
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.includes('pdf')) {
      return cb(new Error("Only PDFs allowed"));
    }
    cb(null, true);
  }
});

app.post('/upload', upload.single('file'), (req, res) => {
  res.json({ message: "File uploaded safely" });
});

// ---------------- LOGGING ----------------
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// ---------------- START ----------------
app.listen(3000, () => {
  console.log("🚀 EduLearn Secure Server Running");
});