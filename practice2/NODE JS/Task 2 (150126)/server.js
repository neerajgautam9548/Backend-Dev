const http = require("http");
const url = require("url");
const fs = require("fs");

const server = http.createServer((req, res) => {
  if (req.url.startsWith("/product")) {
    const parsedUrl = url.parse(req.url, true);

    const name = parsedUrl.query.name;
    const price = Number(parsedUrl.query.price);
    const discount = Number(parsedUrl.query.discount);

    const discountAmount = (price * discount) / 100;
    const finalPrice = price - discountAmount;

    const logData =
      `Product Name: ${name}, ` +
      `Price: ${price}, ` +
      `Discount: ${discount}%, ` +
      `Final Price: ${finalPrice}\n`;

    fs.appendFile("searches.txt", logData, (err) => {
      if (err) console.error("File write error");
    });

    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(`
      <html>
        <body>
          <h1>Product Search Result</h1>
          <p>Product Name: ${name}</p>
          <p>Original Price: ₹${price}</p>
          <p>Discount: ${discount}%</p>
          <p>Final Price: ₹${finalPrice}</p>
        </body>
      </html>
    `);
  } else {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("404 Page Not Found");
  }
});

server.listen(7054, () => {
  console.log("Server running at http://localhost:7054");
});