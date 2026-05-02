const express = require('express');
const session = require('express-session');

const app = express();
app.use(express.json());

app.use(session({
  secret: 'auth-secret',
  resave: false,
  saveUninitialized: false
}));

// In-memory storage
const users = [
  { id: 1, username: "user1", role: "user" },
  { id: 2, username: "mod1", role: "moderator" },
  { id: 3, username: "admin1", role: "admin" }
];

const posts = [];

/*
POST structure:
{
  id,
  title,
  content,
  userId
}
*/

// ------------------- AUTH MIDDLEWARE -------------------

// Check login
const isAuthenticated = (req, res, next) => {
  if (!req.session.user) {
    return res.status(401).json({
      error: "Unauthorized: Please login first"
    });
  }
  next();
};

// Role-based access
const requireRole = (role) => {
  return (req, res, next) => {
    const user = req.session.user;

    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Admin can access everything
    if (user.role === "admin") {
      return next();
    }

    if (user.role !== role) {
      return res.status(403).json({
        error: `Forbidden: Requires ${role} role`
      });
    }

    next();
  };
};

// Owner OR moderator/admin
const isOwnerOrModerator = (req, res, next) => {
  const user = req.session.user;
  const postId = parseInt(req.params.id);

  const post = posts.find(p => p.id === postId);

  if (!post) {
    return res.status(404).json({ error: "Post not found" });
  }

  // Owner
  if (post.userId === user.id) {
    return next();
  }

  // Moderator or Admin
  if (user.role === "moderator" || user.role === "admin") {
    return next();
  }

  return res.status(403).json({
    error: "Forbidden: You cannot modify this post"
  });
};

// ------------------- MOCK LOGIN -------------------
app.post('/login', (req, res) => {
  const { username } = req.body;

  const user = users.find(u => u.username === username);

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  req.session.user = user;

  res.json({
    message: "Logged in successfully",
    user
  });
});

// ------------------- ROUTES -------------------

// Create Post (All logged-in users)
app.post('/posts', isAuthenticated, (req, res) => {
  const { title, content } = req.body;

  if (!title || !content) {
    return res.status(400).json({
      error: "Title and content are required"
    });
  }

  const newPost = {
    id: posts.length + 1,
    title,
    content,
    userId: req.session.user.id
  };

  posts.push(newPost);

  res.status(201).json({
    message: "Post created",
    post: newPost
  });
});

// Edit Post (Owner OR Moderator/Admin)
app.put('/posts/:id', isAuthenticated, isOwnerOrModerator, (req, res) => {
  const postId = parseInt(req.params.id);
  const { title, content } = req.body;

  const post = posts.find(p => p.id === postId);

  if (title) post.title = title;
  if (content) post.content = content;

  res.json({
    message: "Post updated",
    post
  });
});

// Delete Post (Moderator/Admin only)
app.delete('/posts/:id',
  isAuthenticated,
  requireRole('moderator'),
  (req, res) => {

    const postId = parseInt(req.params.id);

    const index = posts.findIndex(p => p.id === postId);

    if (index === -1) {
      return res.status(404).json({ error: "Post not found" });
    }

    posts.splice(index, 1);

    res.json({
      message: "Post deleted"
    });
  }
);

// ------------------- ADMIN FEATURE (User Management) -------------------

// Only admin can view all users
app.get('/users',
  isAuthenticated,
  requireRole('admin'),
  (req, res) => {
    res.json({ users });
  }
);

app.listen(3000, () => {
  console.log("Server running on port 3000");
});