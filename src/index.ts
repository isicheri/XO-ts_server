import express,{ Express, request, Request, Response } from "express";
import cors from "cors";
import http from "http";
import uuid from "uuidv4";
import { Server,Socket } from "socket.io";
import { GameManager } from "./gameManager";

const app:Express = express();
const server = http.createServer(app);
let globalReq: Request = request;
const io = new Server(server,{
    cors: {
        origin: "*"
    }
});
app.use(express.json())
const gameManager = new GameManager();
let rooms: {[roomId: string]: {creatorId: string,creator: string; players: string[]; spectators: string[]; userIp: string[];  gameState: {
    board: string[][],
    currentPlayer: number
}}} = {};
function returnUserIp()  {return globalReq.ip};

app.get("/api_v1/:roomId", (req:Request,res:Response) => {
  const {roomId} = req.params;
  const room = rooms[roomId]
  if(room) {
    res.json({
        exist: true
    })
  }else {
    res.json({
        exist: false
    })
  }
})

io.on('connecton',(socket:Socket) => {
console.log("a user connected:",socket.id);

socket.on("create_room", (creatorName: string) => {
    const roomId = `room_${Math.random().toString(36).substring(2,9)}`;
    rooms[roomId] = {
        creatorId: socket.id,
        creator: creatorName,
        players: gameManager.players,
        spectators: gameManager.spectators,
        userIp: [],
        gameState: {
            board: gameManager.board,
            currentPlayer: gameManager.currentPlayer
        }
    };
    let room = rooms[roomId];
    room.userIp.push(returnUserIp() as string)
    room.players?.push(creatorName);
    socket.join(roomId);
    socket.emit("room_created",roomId);
    console.log("Room:",roomId,"by",creatorName);
})

socket.on("join_room",(data: {roomId: string, userName: string, role: "player" | "spectator"}) => {
    console.log(socket.id);
    const room = rooms[data.roomId];
    if(!room) {
        socket.emit('error', "Room Does Not Exist");
        return;
        // io.to(gameManager.players[0]).emit('start_game',{player: 'X'})
//      io.to(gameManager.players[1]).emit('start_game',{player: 'O'})
    }
    if(data.role === "player") {
        if(room.players?.length == 2) {
                socket.emit('error', "players cannot be more than two,join as spectator");
                return;
        }else {
            console.log(socket.id)
            room.players?.push(data.userName)
            io.to(data.roomId).emit("player_joined",{username: data.userName}) 
        }
    }else if(data.role === "spectator") {
        if(room.spectators.includes(data.userName)) {
            socket.emit("error","Already a spectator");
            return;
        }
        if(room.spectators.length === 20) {
            socket.emit("error","room is already full");
        }
        room.spectators.push(data.userName)
        socket.join(data.roomId);
        io.to(data.roomId).emit("spectator_joined",{userName: data.userName})
        socket.emit("game_started","Game is already in progress!");
    }else {
    socket.emit("error","role does not exists");
    }
})


socket.on("make_move",(data: {row: number,col: number,roomId: string}) => {
    const {row,col,roomId} = data;
    const room = rooms[roomId]
    if(room.gameState.board[row][col] === ' ') {
        const symbol = room.gameState.currentPlayer === 0 ? 'X' : 'O';
        room.gameState.board[row][col] = symbol;
        room.gameState.currentPlayer = (gameManager.currentPlayer + 1) % 2;
        const winner = gameManager.checkWinner();
        if(winner) {
     io.to(gameManager.players[0]).emit('game_over',`${winner} wins!`);
     io.to(gameManager.players[1]).emit('game_over',`${winner} wins!`);
     io.emit('game_over',`${winner} wins!`);
     gameManager.board =  [
        [' ',' ' ,' '],
        [' ',' ',' '],
        [' ',' ',' ']
    ];
        }
    }else if(room.gameState.board.flat().every((cell) => cell !== ' ')) {
        io.to(room.players[0]).emit('game_over',"It's a draw");
        io.to(room.players[1]).emit('game_over',"It's a draw");
        io.emit('game_over',"It's a draw");
        gameManager.board =  [
           [' ',' ' ,' '],
           [' ',' ',' '],
           [' ',' ',' ']
        ]
    }
    io.to(room.players[0]).emit('update_board', {board: room.gameState.board})
    io.to(room.players[1]).emit('update_board', {board: room.gameState.board})
    io.emit("update_board",{board:room.gameState.board})
})

//handle player disconnecting 
socket.on("disconnect", () => {
    console.log("user left ", socket.id)
    if(gameManager.players.includes(socket.id)) {
        gameManager.players = gameManager.players.filter((player) => player !== socket.id) 
        io.emit("game_full","A player has disconnected.The game will be reset.");
        gameManager.board =  [
            [' ',' ' ,' '],
            [' ',' ',' '],
            [' ',' ',' ']
         ]
         io.emit('update_board',{board: gameManager.board});

    }else {
      gameManager.spectators = gameManager.spectators.filter(spectator => spectator !== socket.id)

    }
})

})
const PORT = 8001;
server.listen(PORT,() => {
    console.log("server is live....")
})