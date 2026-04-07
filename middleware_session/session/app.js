const express = require("express");
const session = require("express-session");
const cookieParser = require("cookie-parser");

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(session({
  secret: "secretKey",
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 60000 } // 1 min session
}));

// Exercise 1: Multi-step form
app.post("/step1", (req, res) => {
  req.session.formData = { name: req.body.name };
  res.send("Step 1 saved");
});

app.post("/step2", (req, res) => {
  req.session.formData.email = req.body.email;
  res.send("Step 2 saved");
});

app.get("/result", (req, res) => {
  res.json(req.session.formData);
});

// Exercise 2: Language preference
app.get("/set-lang/:lang", (req, res) => {
  res.cookie("lang", req.params.lang, { maxAge: 86400000 });
  res.send("Language set");
});

app.get("/get-lang", (req, res) => {
  res.send(req.cookies.lang || "default");
});

// Exercise 3: Admin panel
const auth = (req, res, next) => {
  if (!req.session.user) return res.status(401).send("Login required");
  next();
};

const isAdmin = (req, res, next) => {
  if (req.session.user.role !== "admin") return res.status(403).send("Forbidden");
  next();
};

app.post("/login", (req, res) => {
  req.session.user = { username: "admin", role: "admin" };
  res.send("Logged in");
});

app.get("/admin", auth, isAdmin, (req, res) => {
  res.send("Welcome Admin");
});

// Exercise 4: Session timeout warning
app.get("/check-session", (req, res) => {
  const remaining = req.session.cookie.maxAge;
  if (remaining < 20000) {
    return res.send("Session expiring soon");
  }
  res.send("Session active");
});

// Exercise 5: Cart system
app.post("/add-cart", (req, res) => {
  if (!req.session.cart) req.session.cart = [];
  req.session.cart.push(req.body.item);
  res.send("Added to session cart");
});

app.get("/cart", (req, res) => {
  res.json(req.session.cart || []);
});

app.listen(3000, () => console.log("Server running"));
