import { prismaClient } from "..";
import { GameManager, UserInterface } from "./gameManager";


export class RoomManager {

room: Map<number,GameManager> = new Map();
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

async addSpectator(roomId:number,user:UserInterface[]) {
    let prismaRoom = await prismaClient.room.findFirst({where: {id: roomId}}); 
    if(this.room.get(roomId)?.spectators.length === 50) {
        console.log("room is full")
    }
this.room.get(roomId)?.spectators.push(...user);
}


}