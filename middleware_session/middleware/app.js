const express = require("express");
const mongoose = require("mongoose");
const requestLogger = require("./middleware/logger");
const mfaMiddleware = require("./middleware/mfa");
const sanitizeMiddleware = require("./middleware/sanitize");
const User = require("./models/User");
const Item = require("./models/Item");

const app = express();
app.use(express.json());
app.use(requestLogger);
app.use(sanitizeMiddleware);

mongoose.connect("mongodb://127.0.0.1:27017/test");

// Test route
app.get("/", (req, res) => {
  res.send("Server running");
});

// MFA protected route
app.post("/secure", mfaMiddleware, (req, res) => {
  res.json({ message: "Secure access granted" });
});

app.listen(3000, () => console.log("Server running on port 3000"));
