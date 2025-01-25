import express,{ Express } from "express";
import cors from "cors";
import http from "http";
import { Server,Socket } from "socket.io";
import { GameManager } from "./gameManager";

const app:Express = express();
const server = http.createServer(app);
const io = new Server(server,{
    cors: {
        origin: ["http://localhost:5173/"]
    }
});
app.use(cors({
    origin:["http://localhost:5173/"]
}))
const gameManager = new GameManager();

let rooms: {[roomId: string]: {creator: string; players: string[] | null; spectators: string[]; gameState: {}}} = {};

io.on('connecton',(socket:Socket) => {
console.log("a user connected:",socket.id);

socket.on("create_room", (creatorName: string) => {
    const roomId = `room_${Math.random().toString(36).substring(2,9)}`;
    rooms[roomId] = {
        creator: creatorName,
        players: gameManager.players,
        spectators: gameManager.spectators,
        gameState: {
            board: gameManager.board,
            currentPlayer: gameManager.currentPlayer
        }
    };
    let room = rooms[roomId];
    room.players?.push(creatorName);
    socket.join(roomId);
    socket.emit("room_created",roomId);
    console.log("Room:",roomId,"by",creatorName);
})

//start game
socket.on("start_game",(roomId: string,creatorName:string) => {
    //Add a player if there is space
// if(gameManager.players.length < 2) {
//     gameManager.players.push(socket.id);
//     socket.emit("waiting","Waiting for player");
//     if(gameManager.players.length === 2) {
//      //start the game when both players are connected
//      io.to(gameManager.players[0]).emit('start_game',{player: 'X'})
//      io.to(gameManager.players[1]).emit('start_game',{player: 'O'})
//      //notify spectators that the game has started
//      io.emit("game_started","Game has started!")
//     }
// }else if(gameManager.players.length === 2 && gameManager.spectators.length < 15) {
//     gameManager.spectators.push(socket.id)
//     socket.emit("spectator_joined","You are now a spectator");
//     socket.emit("game_started","Game is already in progress!");
//     //send the current board to the spectators
//     socket.emit('update_board',{ board:gameManager.board });
// }else {
//     socket.emit("game_full","Game is full. Please wait.");
// }
})

socket.on("join_game_as_player",(roomId: string,playerName:string) => {
    const room = rooms[roomId];
    if(!room) {
        socket.emit('error', "Room Does Not Exist");
        return;
    }
    if(room.players?.length == 2) {
        socket.emit("error","players cannot be more that two");
        return;
    }
    room.players?.push(playerName);
    io.to(roomId).emit("player_invited",playerName);
    console.log("player name:", playerName);
})


socket.on("join_as_spectator",(roomId:string,spectatoreName: string) => {
    const room = rooms[roomId];
    if(!room) {
        socket.emit('error',"Room does not exist");
        return;
    }
    if(room.spectators.includes(spectatoreName)) {
        socket.emit("error","Already a spectator");
        return;
    }
    if(room.spectators.length === 20) {
        socket.emit("error","room is already full");
        return; 
    }
    room.spectators.push(spectatoreName);
    socket.join(roomId);
    io.to(roomId).emit("spectator_joined",spectatoreName);
    socket.emit("game_started","Game is already in progress!");
    console.log("Specator",spectatoreName,"joined the room",roomId);
})


socket.on("make_move",(data: {row: number,col: number,roomId: string}) => {
    const {row,col,roomId} = data;
    const room = rooms[roomId]
    if(gameManager.board[row][col] === ' ') {
        const symbol = gameManager.currentPlayer === 0 ? 'X' : 'O';
        gameManager.board[row][col] = symbol;
        gameManager.currentPlayer = (gameManager.currentPlayer + 1) % 2;
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
    }else if(gameManager.board.flat().every((cell) => cell !== ' ')) {
        io.to(gameManager.players[0]).emit('game_over',"It's a draw");
        io.to(gameManager.players[1]).emit('game_over',"It's a draw");
        io.emit('game_over',"It's a draw");
        gameManager.board =  [
           [' ',' ' ,' '],
           [' ',' ',' '],
           [' ',' ',' ']
        ]
    }
    io.to(gameManager.players[0]).emit('update_board', {board: gameManager.board})
    io.to(gameManager.players[1]).emit('update_board', {board: gameManager.board})
    io.emit("update_board",{board:gameManager.board})
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