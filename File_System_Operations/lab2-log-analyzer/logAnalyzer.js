const fs = require("fs");
const readline = require("readline");

const file = process.argv[2];
let error = 0, warn = 0, info = 0;

const rl = readline.createInterface({
  input: fs.createReadStream(file),
  crlfDelay: Infinity
});

rl.on("line", line => {
  if (line.includes("ERROR")) error++;
  else if (line.includes("WARN")) warn++;
  else if (line.includes("INFO")) info++;
});

rl.on("close", () => {
  console.log("INFO:", info);
  console.log("WARN:", warn);
  console.log("ERROR:", error);
});
