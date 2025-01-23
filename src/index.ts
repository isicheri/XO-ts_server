import express,{ Express } from "express";
import http from "http";
import { Server } from "socket.io";

const app:Express = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));



const PORT = 3000;

app.listen(PORT,() => {
    console.log("server is live....")
})