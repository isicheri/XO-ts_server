import express,{ Express } from "express";
import {WebSocketServer} from "ws"
import helmet from "helmet";
import { PrismaClient } from '../src/generated/prisma/client'
import indexRouter from "./routes";
import { errorMiddleware, requestLogger } from "./middleware/custom.middleware";
import { PORT } from "./custom/secret";
const app:Express = express();
const wss = new WebSocketServer({port: 8008})
app.use(express.json())
app.use(helmet())
app.use(requestLogger)
app.use("/api/v1",indexRouter);
export const prismaClient = new PrismaClient({
    log: ["query"]
});
wss.on("connection",(ws) => {
    ws.on("error",console.error)
    ws.on("message",(data) => {
        console.log("message recieved: ",data)
    })
    // ws.on("open",() => {})
})
app.use(errorMiddleware)
app.listen(PORT,() => {
    console.log("server is live....")
});