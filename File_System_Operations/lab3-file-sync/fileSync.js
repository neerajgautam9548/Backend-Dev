const fs = require("fs");
const path = require("path");

const src = process.argv[2];
const dest = process.argv[3];

function sync(s, d) {
  if (!fs.existsSync(d)) fs.mkdirSync(d);
  fs.readdirSync(s).forEach(f => {
    const sp = path.join(s, f);
    const dp = path.join(d, f);
    if (fs.statSync(sp).isDirectory()) sync(sp, dp);
    else if (!fs.existsSync(dp) || fs.statSync(sp).mtime > fs.statSync(dp).mtime)
      fs.copyFileSync(sp, dp);
  });
}

sync(src, dest);
console.log("Sync complete");
