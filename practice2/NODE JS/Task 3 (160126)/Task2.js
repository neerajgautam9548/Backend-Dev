const express = require("express");
const fs = require("fs");
const path = require("path");
const app = express();

app.get("/admin", (req, res) => {
  const { user, pass } = req.query;

  if (user === "admin" && pass === "1234") {
    const filePath = path.join(__dirname, "admin_dashboard.html");

    fs.readFile(filePath, "utf8", (err, data) => {
      if (err) {
        res.status(500).send("Error loading dashboard");
      } else {
        res.send(data);
      }
    });
  } else {
    res.status(401).send("Access Denied.");
  }
});

app.listen(7054, () => {
  console.log("Task 2 server running on port 7054");
});
