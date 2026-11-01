const mongoose=require("mongoose")

async function connectedToDb(){

    try{
    await mongoose.connect(process.env.MONGO_URL)

    console.log("Connected to databas")
}
catch(err){
    console.log(err)
}
}

module.exports=connectedToDb