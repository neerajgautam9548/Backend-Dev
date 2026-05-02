const express = require('express');
const bcrypt = require('bcrypt');

const app = express();
app.use(express.json());

// Dummy user (password = "password123")
const users = [
  {
    email: "john@example.com",
    password: "$2b$10$8wZ7QkQJw7vQz6vH8JQn9e9U8Qxj6pH0QF6YwzjXQp7JzQ7QpZ1bG" // bcrypt hash
  }
];

// email -> { count, firstAttemptTime, lockUntil }
const loginAttempts = new Map();

const MAX_ATTEMPTS = 5;
const WINDOW_TIME = 60 * 60 * 1000; // 1 hour
const LOCK_TIME = 30 * 60 * 1000;   // 30 minutes

// ---------------- CHECK LOGIN ATTEMPTS ----------------
function checkLoginAttempts(email) {
  const record = loginAttempts.get(email);

  if (!record) return { allowed: true };

  // Check if account is locked
  if (record.lockUntil && record.lockUntil > Date.now()) {
    return {
      allowed: false,
      message: `Account locked. Try again after ${Math.ceil((record.lockUntil - Date.now()) / 60000)} minutes`
    };
  }

  // Reset window if expired
  if (Date.now() - record.firstAttemptTime > WINDOW_TIME) {
    loginAttempts.delete(email);
    return { allowed: true };
  }

  return { allowed: true };
}

// ---------------- RECORD FAILED ATTEMPT ----------------
function recordFailedAttempt(email) {
  let record = loginAttempts.get(email);

  if (!record) {
    record = {
      count: 1,
      firstAttemptTime: Date.now(),
      lockUntil: null
    };
  } else {
    record.count += 1;
  }

  // Lock account if exceeded attempts
  if (record.count >= MAX_ATTEMPTS) {
    record.lockUntil = Date.now() + LOCK_TIME;
  }

  loginAttempts.set(email, record);
}

// ---------------- CLEAR ATTEMPTS ----------------
function clearAttempts(email) {
  loginAttempts.delete(email);
}

// ---------------- LOGIN ----------------
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  // Check rate limiting / lock
  const check = checkLoginAttempts(email);
  if (!check.allowed) {
    return res.status(429).json({
      error: check.message
    });
  }

  const user = users.find(u => u.email === email);

  if (!user) {
    recordFailedAttempt(email);
    return res.status(401).json({
      error: "Invalid email or password"
    });
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    recordFailedAttempt(email);

    const record = loginAttempts.get(email);

    return res.status(401).json({
      error: "Invalid email or password",
      attemptsLeft: MAX_ATTEMPTS - record.count > 0
        ? MAX_ATTEMPTS - record.count
        : 0
    });
  }

  // Successful login → clear attempts
  clearAttempts(email);

  res.json({
    message: "Login successful"
  });
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});