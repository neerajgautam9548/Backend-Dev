const express = require('express');
const passport = require('passport');
const session = require('express-session');
const LocalStrategy = require('passport-local').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());

// Session setup (for local strategy)
app.use(session({
  secret: 'passport-secret',
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

const JWT_SECRET = 'jwt-secret';

// Dummy users
const users = [
  { id: 1, username: "john", password: "1234" }
];

// ---------------- SERIALIZE ----------------
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  const user = users.find(u => u.id === id);
  done(null, user || false);
});

// ---------------- LOCAL STRATEGY ----------------
passport.use('local', new LocalStrategy(
  async (username, password, done) => {
    try {
      const user = users.find(u => u.username === username);

      if (!user || user.password !== password) {
        return done(null, false, { message: "Invalid credentials" });
      }

      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }
));

// ---------------- JWT STRATEGY ----------------
passport.use('jwt', new JwtStrategy(
  {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: JWT_SECRET
  },
  (payload, done) => {
    try {
      const user = users.find(u => u.id === payload.id);

      if (!user) {
        return done(null, false);
      }

      return done(null, user);
    } catch (err) {
      return done(err, false);
    }
  }
));

// ---------------- LOGIN (SESSION) ----------------
app.post('/auth/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      return res.status(500).json({ error: "Internal error" });
    }

    if (!user) {
      return res.status(401).json({
        error: info?.message || "Login failed"
      });
    }

    req.login(user, (err) => {
      if (err) {
        return res.status(500).json({ error: "Login session failed" });
      }

      return res.json({
        message: "Logged in (session)",
        user: { id: user.id, username: user.username }
      });
    });
  })(req, res, next);
});

// ---------------- API LOGIN (JWT) ----------------
app.post('/auth/api-login', (req, res, next) => {
  passport.authenticate('local', { session: false }, (err, user, info) => {
    if (err) {
      return res.status(500).json({ error: "Internal error" });
    }

    if (!user) {
      return res.status(401).json({
        error: info?.message || "Login failed"
      });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: '15m' }
    );

    return res.json({
      message: "Logged in (JWT)",
      token
    });
  })(req, res, next);
});

// ---------------- SESSION PROTECTED ----------------
app.get('/dashboard',
  (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    next();
  },
  (req, res) => {
    res.json({
      message: "Welcome to dashboard",
      user: req.user
    });
  }
);

// ---------------- JWT PROTECTED ----------------
app.get('/api/profile',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    res.json({
      message: "Profile data",
      user: req.user
    });
  }
);

// ---------------- SWITCH AUTH METHOD ----------------
app.get('/auth/method', (req, res) => {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return res.json({ method: "session" });
  }
  return res.json({ method: "jwt or none" });
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});