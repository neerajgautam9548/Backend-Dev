
Book API Practice (Node.js + Express)

Features implemented:
1. Filter books by author or year
2. Pagination using ?page & limit
3. Search books by title
4. Input validation middleware for year
5. Full CRUD for authors

Install dependencies:
npm install

Run server:
npm start

Example APIs:

Get books
GET /books

Filter
GET /books?author=John
GET /books?year=2020

Pagination
GET /books?page=1&limit=2

Search
GET /books/search?title=node

Create book
POST /books

Authors CRUD
GET /authors
POST /authors
PUT /authors/:id
DELETE /authors/:id
