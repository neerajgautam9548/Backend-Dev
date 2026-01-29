const fs = require("fs");

const command = process.argv[2];
const arg1 = process.argv[3];
const arg2 = process.argv[4];

function help() {
  console.log("Commands: read, write, copy, delete, list");
}

if (command === "read") {
  fs.readFile(arg1, "utf8", (e, d) => e ? console.log(e.message) : console.log(d));
}
else if (command === "write") {
  fs.writeFile(arg1, arg2, e => e ? console.log(e.message) : console.log("Written"));
}
else if (command === "copy") {
  fs.copyFile(arg1, arg2, e => e ? console.log(e.message) : console.log("Copied"));
}
else if (command === "delete") {
  fs.unlink(arg1, e => e ? console.log(e.message) : console.log("Deleted"));
}
else if (command === "list") {
  fs.readdir(arg1 || ".", (e, files) => {
    if (e) console.log(e.message);
    else files.forEach(f => console.log(f));
  });
}
else {
  help();
}
