const express=require('express');

function add(a,b){
    return a+b;
}
function remove(a,b){
    return a+b;
}
module.exports={add,remove};

FileSystem.appendFileSync("test.txt",new Date().toLocaleString());
const file=FileSystem.readFileSync("test.txt","utf-8")

index.listen(3000,()=>{
    console.log("server is running on port : 3000");
})