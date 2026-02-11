const os = require("os");
const fs = require("fs");

function logSystemInfo() {
  const totalMemory = (os.totalmem() / (1024 ** 3)).toFixed(2);
  const freeMemory = (os.freemem() / (1024 ** 3)).toFixed(2);
  const platform = os.platform();
  const uptime = (os.uptime() / 3600).toFixed(2);
  const model = os.cpus()[0].model;

  const logData = `
Time: ${new Date().toLocaleString()}
Total Memory: ${totalMemory} GB
Free Memory: ${freeMemory} GB
Platform: ${platform}
Uptime: ${uptime} hours
CPU Model: ${model}
---------------------------
`;

  fs.appendFile("system_os_module_log.txt", logData, (err) => {
    if (err) {
      console.error("Error writing log:", err);
    }
  });
}

setInterval(logSystemInfo, 3000);
