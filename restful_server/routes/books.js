
const express=require("express");
const router=express.Router();

const books=require("../data/books");
const validateYear=require("../middleware/validateYear");

// GET all books with filter + pagination
router.get("/",(req,res)=>{

 let {author,year,page,limit}=req.query;

 let result=[...books];

 if(author){
  result=result.filter(b=>b.author.toLowerCase()===author.toLowerCase());
 }

 if(year){
  result=result.filter(b=>b.year==year);
 }

 page=parseInt(page)||1;
 limit=parseInt(limit)||5;

 const start=(page-1)*limit;
 const end=page*limit;

 const paginated=result.slice(start,end);

 res.json({
  page,
  limit,
  total:result.length,
  data:paginated
 });

});

// Search books by title
router.get("/search",(req,res)=>{

 const {title}=req.query;

 const result=books.filter(book=>
  book.title.toLowerCase().includes(title.toLowerCase())
 );

 res.json(result);

});

// Create book
router.post("/",validateYear,(req,res)=>{

 const book=req.body;
 book.id=books.length+1;

 books.push(book);

 res.json(book);

});

// Update book
router.put("/:id",(req,res)=>{

 const id=parseInt(req.params.id);

 const index=books.findIndex(b=>b.id===id);

 if(index===-1){
  return res.status(404).json({message:"Book not found"});
 }

 books[index]={...books[index],...req.body};

 res.json(books[index]);

});

// Delete book
router.delete("/:id",(req,res)=>{

 const id=parseInt(req.params.id);

 const index=books.findIndex(b=>b.id===id);

 if(index===-1){
  return res.status(404).json({message:"Book not found"});
 }

 const deleted=books.splice(index,1);

 res.json(deleted);

});

module.exports=router;
