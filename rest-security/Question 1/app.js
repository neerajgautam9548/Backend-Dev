const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const bcrypt = require('bcrypt');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const xss = require('xss');

const app = express();
app.use(express.json());

// ---------------- DATABASE ----------------
mongoose.connect('mongodb://127.0.0.1:27017/shopeasy');

// ---------------- MODELS ----------------
const userSchema = new mongoose.Schema({
  email: String,
  password: String
});

const productSchema = new mongoose.Schema({
  name: String,
  price: Number
});

const reviewSchema = new mongoose.Schema({
  comment: String
});

const User = mongoose.model('User', userSchema);
const Product = mongoose.model('Product', productSchema);
const Review = mongoose.model('Review', reviewSchema);

// ---------------- SECURITY HEADERS ----------------
app.use(helmet());

app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "https://www.youtube.com"],
    imgSrc: ["'self'", "https://cdn.shopeasy.com"],
    frameSrc: ["https://www.youtube.com"],
    connectSrc: ["'self'", "https://api.paymentgateway.com"],
    styleSrc: ["'self'", "'unsafe-inline'"]
  }
}));

// ---------------- SESSION (MongoStore) ----------------
app.use(session({
  secret: 'super-secret-key',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: 'mongodb://127.0.0.1:27017/shopeasy'
  }),
  cookie: {
    maxAge: 1000 * 60 * 30, // 30 min
    httpOnly: true,
    secure: false,
    sameSite: 'lax'
  }
}));

// ---------------- RATE LIMITING ----------------
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: "Too many login attempts"
});

app.use('/login', loginLimiter);

// ---------------- AUTH ----------------
app.post('/register', async (req, res) => {
  const { email, password } = req.body;

  const hashed = await bcrypt.hash(password, 10);

  const user = new User({ email, password: hashed });
  await user.save();

  res.json({ message: "User registered" });
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  req.session.userId = user._id;

  res.json({ message: "Login successful" });
});

// ---------------- AUTH MIDDLEWARE ----------------
function isAuthenticated(req, res, next) {
  if (!req.session.userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}

// ---------------- PRODUCT SEARCH (SAFE) ----------------
app.get('/products', async (req, res) => {
  let { search } = req.query;

  if (typeof search !== 'string') {
    return res.status(400).json({ error: "Invalid input" });
  }

  // Escape regex (prevents injection)
  search = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  const products = await Product.find({
    name: { $regex: search, $options: 'i' },
    price: { $gte: 0 } // prevent negative prices
  });

  res.json(products);
});

// ---------------- REVIEW (XSS SAFE) ----------------
app.post('/reviews', isAuthenticated, async (req, res) => {
  let { comment } = req.body;

  comment = xss(comment); // sanitize

  const review = new Review({ comment });
  await review.save();

  res.json({ message: "Review submitted safely" });
});

// ---------------- PROTECTED ROUTE ----------------
app.get('/dashboard', isAuthenticated, (req, res) => {
  res.json({ message: "Welcome to dashboard" });
});

// ---------------- START SERVER ----------------
app.listen(3000, () => {
  console.log("🚀 Secure ShopEasy server running on port 3000");
});