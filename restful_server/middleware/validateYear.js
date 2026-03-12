
function validateYear(req,res,next){

 const {year}=req.body;

 if(year===undefined || isNaN(year)){
   return res.status(400).json({message:"Year must be a number"});
 }

 const currentYear=new Date().getFullYear();

 if(year<1500 || year>currentYear){
   return res.status(400).json({message:"Year out of valid range"});
 }

 next();
}

module.exports=validateYear;
