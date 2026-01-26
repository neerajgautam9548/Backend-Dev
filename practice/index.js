const express = require("express");
const fs = require("fs");

const app = express();

// Functions
function add(a, b) {
  return a + b;
}

function remove(a, b) {
  return a - b;
}

module.exports = { add, remove };

// File system work
fs.appendFileSync("test.txt", new Date().toLocaleString() + "\n");
const file = fs.readFileSync("test.txt", "utf-8");

// Server
app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
