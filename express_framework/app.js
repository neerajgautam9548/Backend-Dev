const express = require('express');
const app = express();
const path = require('path');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Middleware: Response Time Logger
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.url} - ${duration}ms`);
  });
  next();
});

// Users Route with Query Filter
const users = [
  { id: 1, name: "Neeraj" },
  { id: 2, name: "Rahul" },
  { id: 3, name: "Neha" }
];

app.get('/users', (req, res) => {
  const nameQuery = req.query.name;
  if (nameQuery) {
    const filteredUsers = users.filter(user =>
      user.name.toLowerCase().includes(nameQuery.toLowerCase())
    );
    return res.json(filteredUsers);
  }
  res.json(users);
});

// Contact Form
app.get('/contact', (req, res) => {
  res.render('contact');
});

app.post('/contact', (req, res) => {
  const { name, email } = req.body;
  res.send(`Thank you ${name}, we received your email: ${email}`);
});

// Gallery
app.get('/gallery', (req, res) => {
  const images = ['photo1.jpg', 'photo2.jpg'];
  res.render('gallery', { images });
});

// Blog System
let posts = [
  { id: 1, title: "First Post", content: "This is my first blog post" }
];

app.get('/posts', (req, res) => {
  res.render('posts', { posts });
});

app.get('/posts/new', (req, res) => {
  res.render('new');
});

app.post('/posts', (req, res) => {
  const { title, content } = req.body;
  const newPost = {
    id: posts.length + 1,
    title,
    content
  };
  posts.push(newPost);
  res.redirect('/posts');
});

app.get('/posts/:id', (req, res) => {
  const post = posts.find(p => p.id == req.params.id);
  if (!post) return res.status(404).render('404');
  res.render('post', { post });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).render('404');
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
