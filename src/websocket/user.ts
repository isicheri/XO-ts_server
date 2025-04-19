import { WebSocketServer } from "ws";
import { prismaClient } from "..";
import { RoomManager } from "./roomManager";
import { OutgoingMessage } from "http";


function genRandomId(LENGTH: number) {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwsyz0123456789"
    let result = "";
    for(let i = 0; i < LENGTH; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result
}

export class User  {

     id: number
    username: string;

constructor(private ws: WebSocketServer) {
    this.id = 0;
    this.username = "";
}


initializer() {
    this.ws.on("message",async(data) => {
        const parsedData = JSON.parse(data);
        switch (parsedData.type) {
            case "join_room":
             const roomId = parsedData.roomName;
                  const room = await prismaClient.room.findFirst({where: {name:roomId},include: {user:true}})
                  if(!room) {
                    this.ws.close();
                    return;
                  }
                  this.id = parsedData.userId,
                  this.username = parsedData.username
                RoomManager.getInstance().joinRoom(parsedData.as,this,room.name)
                break;


                case "leave_room":
                 this.id = parsedData.userId;
                 this.username = parsedData.username;
                 const currentRoom = RoomManager.getInstance().room.get(parsedData.roomId);
                 const dbRoom = await prismaClient.room.findFirst({where: {name: parsedData.roomId}})
                if(currentRoom?.players.includes(this)) {
                    RoomManager.getInstance().leaveRoom(this,parsedData.roomId);    
                    setTimeout(() => {
                        this.ws.close()
                    },2000)
                  await prismaClient.room.delete({where: {id: dbRoom?.id}})     
                }else {
                  RoomManager.getInstance().leaveRoom(this,parsedData.roomId);
                 this.ws.close()
                }   
                break;

                case "player_move":
                
                break;


        }
    })  
}


send(payload:OutgoingMessage) {

}

}