import { GameManager } from "./gameManager";
import { User } from "./user";

export type OutgoingMessage = any;
export type GameMove = {row:number,col:number,symbol: "X" | "O"}

export class RoomManager {

room: Map<string,GameManager> = new Map();
static instance: RoomManager;
  
private constructor() {
    this.room = new Map()
}


static getInstance() {
    if(!this.instance) {
      this.instance = new RoomManager();
    }
    return this.instance;
}

  joinRoom(as: "player" | "spectator",user:User,roomId: string) {
    if(!this.room.has(roomId)) {
        this.room.set(roomId,new GameManager())
        this.room.get(roomId)?.players.push(user)
        return;
    }else {
    if(as === "player") {
   if(this.room.get(roomId)?.players.length === 2) {
     this.room.get(roomId)?.spectators.push(user)
   }
   this.room.get(roomId)?.players.push(user)
   }else if(as === "spectator"){
     if(this.room.get(roomId)?.spectators.length === 50) {
       return;
     }
     this.room.get(roomId)?.spectators.push(user)
   }else {
    return;
   }
    }   
  }

  leaveRoom(user:User,roomId:string) {
    let currentRoom =  this.room.get(roomId);
    if(!currentRoom?.players.includes(user)) {
      currentRoom?.spectators.filter((data) => data !== user)
      return
    }else {
        this.room.delete(roomId);
        return 
    }
  }

  moves(roomId:string,user:User,move: GameMove) {
    if(!this.room.has(roomId)) {
      return;
    }
    const currentRoom = this.room.get(roomId);
    currentRoom?.updateBoard(user,move)
  }

   broadCastMessage(message: OutgoingMessage,user:User,roomId:string) {
    if(!this.room.has(roomId)) {
      return;
    }
      const players:Array<User>  | undefined = this.room.get(roomId)?.players;
      const spectators:Array<User> | undefined = this.room.get(roomId)?.spectators;
      const allUsers = [...players!,...spectators!];
       allUsers.forEach(u => {
        if(u.id !== user.id) {
          u.send(JSON.parse(message))
        }
       })
   }

}