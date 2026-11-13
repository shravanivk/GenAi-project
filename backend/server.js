
const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

require("dotenv").config();

const app = require("./src/app");
const connectedToDb = require("./src/config/database");

async function startServer() {
    try {
        await connectedToDb();

        console.log("MongoDB Connected");

        app.listen(3000, () => {
            console.log("Server is running on port 3000");
        });

    } catch (error) {
        console.log("Database connection failed:", error.message);
        process.exit(1);
    }
}

startServer();
