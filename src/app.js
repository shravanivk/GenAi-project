const express=require("express")
const cookieParse=require("cookie-parser")

const app=express()//Use that Express machine and create MY application

app.use(express.json())//whenever the frontend sends JSON data, understand it
app.use(cookieParse())
const authRouter=require("./routes/auth.routes")
app.use("/api/auth",authRouter)//api create karne or ye prefix lagana padega


module.exports=app