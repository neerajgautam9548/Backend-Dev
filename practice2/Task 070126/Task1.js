// Task 1: The "API Response" Formatter
// Scenario: You fetched a list of users from the database, but you don't want to send their
// passwords to the frontend.
// JavaScript
// const rawUsers = [
// { id: 1, name: "Rahul", password: "fb_password", role: "admin" },
// { id: 2, name: "Sanya", password: "123_password", role: "user" },
// { id: 3, name: "Amit", password: "secret_password", role: "user" }
// ];
// // TASK:
// // 1. Use .map() and the Rest operator (...) to create a new array
// // called 'safeUsers' that contains everything EXCEPT the password.
// // 2. Use .filter() to create an array of 'admins' only.


//Solution
const rawUsers = [
  { id: 1, name: "Rahul", password: "fb_password", role: "admin" },
  { id: 2, name: "Sanya", password: "123_password", role: "user" },
  { id: 3, name: "Amit", password: "secret_password", role: "user" }
];

// 1. Remove passwords using map() and rest operator
const safeUsers = rawUsers.map(({ password, ...userWithoutPassword }) => {
  return userWithoutPassword;
});

// 2. Filter only admins
const admins = safeUsers.filter(user => user.role === "admin");

console.log("Safe Users:", safeUsers);
console.log("Admins:", admins);
