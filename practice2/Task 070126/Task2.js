// Task 2: The Shopping Cart Logic
// Scenario: A user is checking out. You need to calculate the total and verify stock.
// JavaScript
// const cart = [
// { item: "Laptop", price: 50000, quantity: 1, inStock: true },
// { item: "Mouse", price: 1500, quantity: 2, inStock: true },
// { item: "Keyboard", price: 3000, quantity: 1, inStock: false }
// ];
// // TASK:
// // 1. Check if "every" item is inStock. Print "Ready to Ship" or "Wait".
// // 2. Filter out the items that are NOT in stock.
// // 3. Use .reduce() on the filtered list to find the final 'Total Bill'.


//Solution
const cart = [
  { item: "Laptop", price: 50000, quantity: 1, inStock: true },
  { item: "Mouse", price: 1500, quantity: 2, inStock: true },
  { item: "Keyboard", price: 3000, quantity: 1, inStock: false }
];

// 1. Check if every item is in stock
const readyToShip = cart.every(product => product.inStock);
console.log(readyToShip ? "Ready to Ship" : "Wait");

// 2. Filter out items that are NOT in stock
const availableItems = cart.filter(product => product.inStock);

// 3. Calculate total bill using reduce()
const totalBill = availableItems.reduce((total, product) => {
  return total + product.price * product.quantity;
}, 0);

console.log("Available Items:", availableItems);
console.log("Total Bill:", totalBill);
