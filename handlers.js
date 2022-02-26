function error(error, message){
  if(error){console.log(message + ": failed");} else{console.log(message + " Succeeded")}
}
module.exports={error};
