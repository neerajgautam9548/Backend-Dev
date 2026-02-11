const fs = require("fs");

function logActivity(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `${message} - ${timestamp}\n`;

  fs.appendFile("activity.log", logMessage, (err) => {
   if(err){
        console.log(arr)
    }
    else{
        console.log("file is created")
    }
  });
}

module.exports = logActivity;