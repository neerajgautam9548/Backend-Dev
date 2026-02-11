const express = require("express");
const fs = require("fs");
const app = express();

app.get("/complain", (req, res) => {
  const { name, issue, priority } = req.query;

  const ticketId = "TKT-" + Math.floor(Math.random() * 1000000);

  const logData = `TicketID: ${ticketId}\nName: ${name}\nIssue: ${issue}\nPriority: ${priority}\n----------------------\n`;

  if (priority === "high") {
    fs.appendFileSync("URGENT.txt", logData);
  } else {
    fs.appendFileSync("normal_complaints.txt", logData);
  }

  res.json({
    ticketId: ticketId,
    message: "We will solve your issue soon."
  });
});

app.listen(7054, () => {
  console.log("Task 1 server running on port 7054");
});
