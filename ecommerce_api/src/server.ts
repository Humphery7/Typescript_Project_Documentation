import "dotenv/config";
import app from "./app.js";
import { connectDB, disconnectDB } from "./services/databaseService.js";

const PORT = Number(process.env.PORT) || 3000;

const server = app.listen(PORT, async () => {
    console.log(`Server running on port ${PORT}`)
    await connectDB();
})


const shutdown = async () => {
    console.log("Shutting down...")
    server.close(async () => {

        await disconnectDB();
        console.log("Database pool closed")
        process.exit(0)
    })

}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

