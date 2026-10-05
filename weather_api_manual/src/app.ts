import "dotenv/config";
import express, { type Express, type Request, type Response } from "express";
import weatherRouter from './routes/weatherRoute.js'
import errorHandler from "./middleware/errorHandler.js"

const app: Express = express();

app.get("/", (req: Request, res: Response) => {
    res.status(200).json({ message: "Hello world" });
});

app.use('/weather', weatherRouter)

app.use(errorHandler)

export default app;