// Q1;
const obj = { a: "one", b: "two", a: "three" };
console.log(obj,"1")

// Q2;
const a = {};
const b = { key: "b" };
const c = { key: "c" };

a[b] = 123;
a[c] = 456;

console.log(a[b],"2");

// Q3;
const user = { name: "Lydia", age: 21 };
const admin = { admin: true, ...user };
console.log(admin,"3");

// Q4;
const shape = {
  radius: 10,
  diameter() {
    return this.radius * 2;
  },
  perimeter: () => 2 * Math.PI * this.radius,
};

console.log(shape.diameter(),"4.1");
console.log(shape.perimeter(),"4.2");

// Q5;
function test() {
    console.log(a,"5a");
    console.log(b,"5b");
   
    var a = 10;
    let b = 20;
}
test();

// Q6;
var x = 10;
if (true) {
  var x = 20;
  console.log(x);
}
console.log(x);

let y = 10;
if (true) {
  let y = 20;
  console.log(y);
}
console.log(y);