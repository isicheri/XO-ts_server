import { GameManager } from "./gameManager";
import { User } from "./user";

export type OutgoingMessage = unknown;

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

  moves() {}

   broadCastMessage(message: OutgoingMessage,user:User,roomId:string) {}

}