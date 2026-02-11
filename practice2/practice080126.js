const getUserData = async()=>{
  
}
const fetchUser=(id)=>{
  return new Promise((resolve,reject)=>{
    setTimeout(()=>{
      const users = {1:{name:"Ayush", phone:"7055803517"}}
    })
  })
}
const getUsersData = async () => {
  try{
    const user = await fetchUser(4);
    console.log("user data", user);
  }
  catch(e){
    console.log(e);
  }
};
getUsersData();