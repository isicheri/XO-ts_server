export interface UserInterface {
  username: string;
}

export class GameManager {
    board: string[][];
    players: UserInterface[];
    currentPlayer: number;
    spectators: UserInterface[]

    constructor() {
     this.board = [
        [' ',' ',' '],
        [' ',' ',' '],
        [' ',' ',' ']
    ];
     this.players = [];
     this.currentPlayer = 0;
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

}