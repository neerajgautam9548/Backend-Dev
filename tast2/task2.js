const express = require("express");
const fs = require("fs");

const app = express();

app.get("/admin", (req, res) => {
    const { user, pass } = req.query;

    // Check credentials
    if (user === "admin" && pass === "1234") {
        fs.readFile("admin_dashboard.html", "utf8", (err, data) => {
            if (err) {
                return res.status(500).send("File not found");
            }
            res.send(data);
        });
    } else {
        res.status(401).send("Access Denied");
    }
});

app.listen(8000, () => {
    console.log("Task 2 server running on port 8000");
});
