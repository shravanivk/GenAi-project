const dns = require("dns");

dns.setServers(["8.8.8.8"]);

require("dotenv").config()

const app=require("./src/app")
const connectedToDb=require("./src/config/database")

connectedToDb()

app.listen(3000,()=>{
    console.log("server is running on port 3000")
})