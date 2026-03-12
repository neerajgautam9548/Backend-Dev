
const express=require("express");
const router=express.Router();

const authors=require("../data/authors");

// GET authors
router.get("/",(req,res)=>{
 res.json(authors);
});

// CREATE author
router.post("/",(req,res)=>{

 const author=req.body;
 author.id=authors.length+1;

 authors.push(author);

 res.json(author);

});

// UPDATE author
router.put("/:id",(req,res)=>{

 const id=parseInt(req.params.id);

 const index=authors.findIndex(a=>a.id===id);

 if(index===-1){
  return res.status(404).json({message:"Author not found"});
 }

 authors[index]={...authors[index],...req.body};

 res.json(authors[index]);

});

// DELETE author
router.delete("/:id",(req,res)=>{

 const id=parseInt(req.params.id);

 const index=authors.findIndex(a=>a.id===id);

 if(index===-1){
  return res.status(404).json({message:"Author not found"});
 }

 const deleted=authors.splice(index,1);

 res.json(deleted);

});

module.exports=router;
