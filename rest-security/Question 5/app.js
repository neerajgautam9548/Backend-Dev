const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const bcrypt = require('bcrypt');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const crypto = require('crypto');
const validator = require('validator');
const xss = require('xss');

const app = express();
app.use(express.json());

// ---------------- DATABASE ----------------
mongoose.connect('mongodb://127.0.0.1:27017/quickbank');

// ---------------- MODELS ----------------
const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  balance: Number,
  accountNumber: String,
  resetToken: String,
  resetExpires: Date,
  deviceId: String
});

const txSchema = new mongoose.Schema({
  from: String,
  to: String,
  amount: Number,
  description: String,
  timestamp: Date
});

const auditSchema = new mongoose.Schema({
  userId: String,
  action: String,
  timestamp: Date
});

const User = mongoose.model('User', userSchema);
const Transaction = mongoose.model('Transaction', txSchema);
const Audit = mongoose.model('Audit', auditSchema);

// ---------------- HELMET + CSP ----------------
app.use(helmet());
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'"],
    connectSrc: ["'self'"],
    imgSrc: ["'self'"],
    styleSrc: ["'self'"]
  }
}));

// ---------------- SESSION ----------------
app.use(session({
  secret: 'bank-secret',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: 'mongodb://127.0.0.1:27017/quickbank'
  }),
  cookie: {
    maxAge: 1000 * 60 * 10, // 10 min
    httpOnly: true,
    secure: false
  }
}));

// ---------------- RATE LIMIT ----------------
const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 5 });
const transferLimiter = rateLimit({ windowMs: 1 * 60 * 1000, max: 3 });

app.use('/login', loginLimiter);
app.use('/transfer', transferLimiter);

// ---------------- AUDIT ----------------
async function log(userId, action) {
  await Audit.create({ userId, action, timestamp: new Date() });
}

// ---------------- AUTH ----------------
app.post('/register', async (req, res) => {
  let { email, password } = req.body;

  if (!validator.isEmail(email))
    return res.status(400).json({ error: "Invalid email" });

  if (!validator.isStrongPassword(password))
    return res.status(400).json({ error: "Weak password" });

  const hash = await bcrypt.hash(password, 10);

  const user = new User({
    email,
    password: hash,
    balance: 10000,
    accountNumber: crypto.randomBytes(8).toString('hex')
  });

  await user.save();
  res.json({ message: "Registered" });
});

app.post('/login', async (req, res) => {
  const { email, password, deviceId } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ error: "Invalid" });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(401).json({ error: "Invalid" });

  // Device check
  if (user.deviceId && user.deviceId !== deviceId) {
    return res.status(403).json({ error: "New device detected" });
  }

  user.deviceId = deviceId;
  await user.save();

  req.session.user = user;
  await log(user._id, "Login");

  res.json({ message: "Login success" });
});

// ---------------- 2FA (Simple OTP) ----------------
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

let otpStore = new Map();

// ---------------- TRANSFER ----------------
app.post('/transfer', async (req, res) => {
  const { toAccount, amount, description, otp } = req.body;

  if (!req.session.user)
    return res.status(401).json({ error: "Unauthorized" });

  const user = await User.findById(req.session.user._id);

  // Validate amount
  if (typeof amount !== 'number' || amount <= 0 || amount > 100000)
    return res.status(400).json({ error: "Invalid amount" });

  if (user.balance < amount)
    return res.status(400).json({ error: "Insufficient balance" });

  // 2FA for > $1000
  if (amount > 1000) {
    if (!otp) {
      const code = generateOTP();
      otpStore.set(user.email, code);
      return res.json({ message: "OTP required", otp: code }); // demo
    }

    if (otpStore.get(user.email) !== otp) {
      return res.status(403).json({ error: "Invalid OTP" });
    }
  }

  // Sanitize description
  const cleanDesc = xss(description);

  user.balance -= amount;
  await user.save();

  await Transaction.create({
    from: user.accountNumber,
    to: toAccount,
    amount,
    description: cleanDesc,
    timestamp: new Date()
  });

  await log(user._id, "Transfer");

  res.json({ message: "Transfer successful" });
});

// ---------------- TRANSACTION HISTORY ----------------
app.get('/transactions', async (req, res) => {
  const user = req.session.user;

  if (!user) return res.status(401).json({ error: "Unauthorized" });

  const tx = await Transaction.find({
    from: user.accountNumber
  });

  res.json(tx);
});

// ---------------- PASSWORD RESET ----------------
app.post('/reset-request', async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.json({ message: "If exists, email sent" });

  const token = crypto.randomBytes(32).toString('hex');

  user.resetToken = token;
  user.resetExpires = Date.now() + 15 * 60 * 1000; // 15 min

  await user.save();

  res.json({ message: "Reset link generated", token });
});

app.post('/reset-password', async (req, res) => {
  const { token, newPassword } = req.body;

  const user = await User.findOne({
    resetToken: token,
    resetExpires: { $gt: Date.now() }
  });

  if (!user) return res.status(400).json({ error: "Invalid/expired token" });

  user.password = await bcrypt.hash(newPassword, 10);
  user.resetToken = null;

  await user.save();

  res.json({ message: "Password reset successful" });
});

// ---------------- SAFE ERROR HANDLER ----------------
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Something went wrong" });
});

// ---------------- START ----------------
app.listen(3000, () => {
  console.log("🏦 Secure Banking Server Running");
});