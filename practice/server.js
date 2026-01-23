const http = require("http");
const fs = require("fs");
const url = require("url");

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url);
    const pathname = parsedUrl.pathname;
    const query = parsedUrl.query;

    const log = `${new Date().toISOString()} | ${req.method} | ${req.url}\n`;

    fs.appendFile("server.log", log, (err) => {
        if (err) {
            console.error("Error writing log:", err);
        }
    });

    switch (pathname) {
        case "/":
            res.writeHead(200, { "Content-Type": "text/plain" });
            res.end("Welcome to the Home Page");
            break;

        case "/about":
            const user = {
                name: "Neeraj",
                age: 20,
                occupation: "Backend Developer"
            };
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify(user));
            break;
        case "/greet":
            const name = query.name || "Guest";
            res.writeHead(200, { "Content-Type": "text/plain" });
            res.end(`Hello, ${name}! Welcome to our server.`);
            break;

        default:
            res.writeHead(404, { "Content-Type": "text/plain" });
            res.end("Page Not Found");
    }
});

server.listen(8080, () => {
    console.log("Server is running on port 8080");
});