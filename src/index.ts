import express,{ Express } from "express";
import http from "http";
import { Server,Socket } from "socket.io";
import { GameManager } from "./gameManager";
import { join } from "path";

const app:Express = express();
const server = http.createServer(app);
const io = new Server(server);
const gameManager = new GameManager();

app.use(express.static("public"));

app.get("/",(req,res) => {
    res.sendFile(join("public","index.html"))
})

io.on('connecton',(socket) => {
console.log("a user connected:",socket.username);

//Add a player if there is space
if(gameManager.players.length < 2) {
    gameManager.players.push(socket.username);
    socket.emit("waiting","Waiting for player");
    if(gameManager.players.length === 2) {
     //start the game when both players are connected
     io.to(gameManager.players[0]).emit('start_game',{player: 'X'})
     io.to(gameManager.players[1]).emit('start_game',{player: 'O'})
     //notify spectators that the game has started
     io.emit("game_started","Game has started!")
    }
}else if(gameManager.players.length === 2 && gameManager.spectators.length < 15) {
    gameManager.spectators.push(socket.username)
    socket.emit("spectator_joined","You are now a spectator");
    socket.emit("game_started","Game is already in progress!");
    //send the current board to the spectators
    socket.emit('update_board',{ board:gameManager.board });
}else {
    socket.emit("game_full","Game is full. Please wait.");
}

socket.on("make_move",(data: any) => {
    const {row,col} = data;
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
    console.log("user left ", socket.username)
    if(gameManager.players.includes(socket.username)) {
        gameManager.players = gameManager.players.filter((player) => player !== socket.username) 
        io.emit("game_full","A player has disconnected.The game will be reset.");
        gameManager.board =  [
            [' ',' ' ,' '],
            [' ',' ',' '],
            [' ',' ',' ']
         ]
         io.emit('update_board',{board: gameManager.board});

    }else {
      gameManager.spectators = gameManager.spectators.filter(spectator => spectator !== socket.username)

    }
})

})


const PORT = 8001;

app.listen(PORT,() => {
    console.log("server is live....")
})