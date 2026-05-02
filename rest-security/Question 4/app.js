const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const bcrypt = require('bcrypt');
const helmet = require('helmet');
const validator = require('validator');
const xss = require('xss');
const multer = require('multer');
const crypto = require('crypto');

const app = express();
app.use(express.json());

// ---------------- DATABASE ----------------
mongoose.connect('mongodb://127.0.0.1:27017/medibook');

// ---------------- MODELS ----------------
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: String
});

const recordSchema = new mongoose.Schema({
  patientId: String,
  doctorId: String,
  data: String // encrypted medical data
});

const auditSchema = new mongoose.Schema({
  userId: String,
  action: String,
  timestamp: Date
});

const User = mongoose.model('User', userSchema);
const Record = mongoose.model('Record', recordSchema);
const Audit = mongoose.model('Audit', auditSchema);

// ---------------- HELMET ----------------
app.use(helmet());

// ---------------- SESSION ----------------
app.use(session({
  secret: 'hipaa-secret',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: 'mongodb://127.0.0.1:27017/medibook'
  }),
  cookie: {
    maxAge: 1000 * 60 * 15, // 15 min (short for healthcare)
    httpOnly: true
  }
}));

// ---------------- ENCRYPTION ----------------
const ENC_KEY = crypto.randomBytes(32);
const IV = crypto.randomBytes(16);

function encrypt(text) {
  const cipher = crypto.createCipheriv('aes-256-cbc', ENC_KEY, IV);
  return cipher.update(text, 'utf8', 'hex') + cipher.final('hex');
}

function decrypt(text) {
  const decipher = crypto.createDecipheriv('aes-256-cbc', ENC_KEY, IV);
  return decipher.update(text, 'hex', 'utf8') + decipher.final('utf8');
}

// ---------------- AUDIT LOG ----------------
async function logAction(userId, action) {
  await Audit.create({
    userId,
    action,
    timestamp: new Date()
  });
}

// ---------------- RBAC ----------------
function requireRole(role) {
  return (req, res, next) => {
    if (!req.session.user || req.session.user.role !== role) {
      return res.status(403).json({ error: "Forbidden" });
    }
    next();
  };
}

// ---------------- AUTH ----------------
app.post('/register', async (req, res) => {
  let { name, email, password } = req.body;

  if (!validator.isEmail(email)) {
    return res.status(400).json({ error: "Invalid email" });
  }

  if (!validator.isStrongPassword(password)) {
    return res.status(400).json({ error: "Weak password" });
  }

  const hashed = await bcrypt.hash(password, 10);

  const user = new User({ name, email, password: hashed, role: 'patient' });
  await user.save();

  res.json({ message: "Registered securely" });
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ error: "Invalid" });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(401).json({ error: "Invalid" });

  req.session.user = user;
  res.json({ message: "Login success" });
});

// ---------------- VALIDATION ----------------
function validateDate(date) {
  return !isNaN(Date.parse(date));
}

// ---------------- MEDICAL RECORD ----------------
app.post('/records', requireRole('doctor'), async (req, res) => {
  let { patientId, data } = req.body;

  data = xss(data);

  const encrypted = encrypt(data);

  const record = new Record({
    patientId,
    doctorId: req.session.user._id,
    data: encrypted
  });

  await record.save();
  await logAction(req.session.user._id, "Created medical record");

  res.json({ message: "Record stored securely" });
});

// ---------------- ACCESS CONTROL FIX ----------------
app.get('/records/:id', async (req, res) => {
  const record = await Record.findById(req.params.id);

  if (!record) return res.status(404).json({ error: "Not found" });

  // Only patient or doctor can view
  if (
    record.patientId !== req.session.user._id.toString() &&
    record.doctorId !== req.session.user._id.toString()
  ) {
    return res.status(403).json({ error: "Unauthorized access" });
  }

  await logAction(req.session.user._id, "Viewed medical record");

  res.json({ data: decrypt(record.data) });
});

// ---------------- SEARCH (INJECTION SAFE) ----------------
app.get('/patients', async (req, res) => {
  let { name } = req.query;

  if (typeof name !== 'string') {
    return res.status(400).json({ error: "Invalid input" });
  }

  name = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  const patients = await User.find({
    name: { $regex: name, $options: 'i' }
  });

  res.json(patients);
});

// ---------------- FILE UPLOAD ----------------
const upload = multer({
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!allowed.includes(file.mimetype)) {
      return cb(new Error("Invalid file type"));
    }
    cb(null, true);
  }
});

app.post('/upload', upload.single('file'), async (req, res) => {
  await logAction(req.session.user._id, "Uploaded document");
  res.json({ message: "File uploaded securely" });
});

// ---------------- START ----------------
app.listen(3000, () => {
  console.log("🚀 MediBook Secure Server Running");
});