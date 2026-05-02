const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const helmet = require('helmet');
const cors = require('cors');
const xss = require('xss');
const validator = require('validator');

const app = express();
app.use(express.json());

// ---------------- DATABASE ----------------
mongoose.connect('mongodb://127.0.0.1:27017/connecthub');

// ---------------- MODELS ----------------
const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
  bio: String,
  profilePic: String
});

const postSchema = new mongoose.Schema({
  userId: String,
  content: String
});

const messageSchema = new mongoose.Schema({
  from: String,
  to: String,
  message: String
});

const User = mongoose.model('User', userSchema);
const Post = mongoose.model('Post', postSchema);
const Message = mongoose.model('Message', messageSchema);

// ---------------- SECURITY HEADERS ----------------
app.use(helmet());

// ---------------- CORS ----------------
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'], // web + mobile dev
  credentials: true
}));

// ---------------- SESSION ----------------
app.use(session({
  secret: 'connecthub-secret',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: 'mongodb://127.0.0.1:27017/connecthub'
  }),
  cookie: {
    maxAge: 1000 * 60 * 20, // 20 minutes
    httpOnly: true,
    sameSite: 'lax'
  }
}));

// ---------------- GLOBAL SANITIZATION MIDDLEWARE ----------------
const sanitizeInput = (req, res, next) => {
  for (let key in req.body) {
    if (typeof req.body[key] === 'string') {
      req.body[key] = xss(req.body[key]);
    }
  }
  next();
};

app.use(sanitizeInput);

// ---------------- SAFE HTML CONFIG (ALLOW LIMITED TAGS) ----------------
const safeHTML = new xss.FilterXSS({
  whiteList: {
    b: [],
    i: [],
    a: ['href']
  },
  stripIgnoreTag: true
});

// ---------------- AUTH ----------------
app.post('/register', async (req, res) => {
  let { username, email, password, bio, profilePic } = req.body;

  // Validation
  if (!validator.isEmail(email)) {
    return res.status(400).json({ error: "Invalid email format" });
  }

  if (!validator.isURL(profilePic)) {
    return res.status(400).json({ error: "Invalid profile picture URL" });
  }

  if (!validator.isLength(username, { min: 3, max: 20 })) {
    return res.status(400).json({ error: "Invalid username" });
  }

  const hashed = await bcrypt.hash(password, 10);

  const user = new User({
    username,
    email,
    password: hashed,
    bio: xss(bio),
    profilePic
  });

  await user.save();

  res.json({ message: "User registered securely" });
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ error: "Invalid credentials" });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(401).json({ error: "Invalid credentials" });

  req.session.userId = user._id;

  res.json({ message: "Login success" });
});

// ---------------- AUTH MIDDLEWARE ----------------
function isAuth(req, res, next) {
  if (!req.session.userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}

// ---------------- POSTS (SAFE HTML) ----------------
app.post('/posts', isAuth, async (req, res) => {
  let { content } = req.body;

  // Allow limited HTML
  content = safeHTML.process(content);

  const post = new Post({
    userId: req.session.userId,
    content
  });

  await post.save();

  res.json({ message: "Post created safely" });
});

app.get('/posts', async (req, res) => {
  const posts = await Post.find();
  res.json(posts);
});

// ---------------- DIRECT MESSAGES (STRICT TEXT ONLY) ----------------
app.post('/messages', isAuth, async (req, res) => {
  let { to, message } = req.body;

  message = xss(message); // no HTML allowed

  const msg = new Message({
    from: req.session.userId,
    to,
    message
  });

  await msg.save();

  res.json({ message: "Message sent securely" });
});

// ---------------- PROFILE ----------------
app.put('/profile', isAuth, async (req, res) => {
  let { bio, profilePic } = req.body;

  if (profilePic && !validator.isURL(profilePic)) {
    return res.status(400).json({ error: "Invalid URL" });
  }

  await User.findByIdAndUpdate(req.session.userId, {
    bio: xss(bio),
    profilePic
  });

  res.json({ message: "Profile updated safely" });
});

// ---------------- FOLLOW SYSTEM ----------------
const followers = [];

app.post('/follow/:id', isAuth, (req, res) => {
  followers.push({
    from: req.session.userId,
    to: req.params.id
  });

  res.json({ message: "Followed user" });
});

// ---------------- LOGOUT ----------------
app.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ message: "Logged out" });
  });
});

// ---------------- START ----------------
app.listen(3000, () => {
  console.log("🚀 ConnectHub secure server running");
});