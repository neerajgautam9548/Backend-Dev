const express = require("express");
const fs = require("fs");

const app = express();
app.use(express.json());

app.post("/complain", (req, res) => {
    const { name, issue, priority } = req.body;

    // Generate Ticket ID
    const ticketId = "TKT-" + Math.floor(Math.random() * 100000);

    const complaintData = `
Ticket ID: ${ticketId}
Name: ${name}
Issue: ${issue}
Priority: ${priority}
-------------------------
`;

    // Decide file name
    const fileName = priority === "high" ? "URGENT.txt" : "normal_complaints.txt";

    fs.appendFile(fileName, complaintData, (err) => {
        if (err) {
            return res.status(500).json({ message: "Error saving complaint" });
        }

        res.json({
            ticketId: ticketId,
            message: "We will solve your issue soon."
        });
    });
});

app.listen(8000, () => {
    console.log("Task 1 server running on port 8000");
});
