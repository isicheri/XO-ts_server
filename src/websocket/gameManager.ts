import { GameMove } from "./roomManager";
import { User } from "./user";


export class GameManager {
    board: string[][];
    players: User[];
    playerSymbol: string | undefined;
    spectators: User[];

    constructor() {
     this.board = [
        [' ',' ',' '],
        [' ',' ',' '],
        [' ',' ',' ']
    ];
     this.players = [];
     this.playerSymbol = undefined;
     this.spectators = []
    }

  checkWinner(): string | null {
   for(let row = 0; row < 3; row++) {
    if(this.board[row][0] === this.board[row][1] && this.board[row][1] === this.board[row][2] && this.board[row][0] !== ' ') {
   return this.board[row][0];
    }
   }

   for(let col = 0; col < 3; col++) {
    if(this.board[0][col] === this.board[1][col] && this.board[1][col] === this.board[2][col] && this.board[0][col] !== ' ') {
        return this.board[0][col];
    }
   }

   if(this.board[0][0] === this.board[1][1] && this.board[1][1] === this.board[2][2] && this.board[0][0] !== ' ') {
    return this.board[0][0];
   }

   if(this.board[0][2] === this.board[1][1] && this.board[1][1] === this.board[2][0] && this.board[0][2] !== ' ' ) {
    return this.board[0][2];
   }

    return null;
  }


  updateBoard(user:User,gameMove:GameMove) {
    let {row,col,symbol} = gameMove;
    if(!this.players.includes(user)) {
      return;
    }
    if(this.board[row][col] !== ' ') {
     return;
    }
    this.board[row][col] = symbol;
  }

  checkBoard() {
    let winner = this.checkWinner()
    if(winner) {
      return winner
    }else {
      console.log("keep playing");
      return !winner;
    }
  }

}