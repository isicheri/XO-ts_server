import { WebSocket } from "ws";
import { prismaClient } from "..";
import { RoomManager,OutgoingMessage } from "./roomManager";


function genRandomId(LENGTH: number) {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwsyz0123456789"
    let result = "";
    for(let i = 0; i < LENGTH; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result
}

export class User  {

      id: number | undefined;
      username: string | undefined;

constructor(private ws: WebSocket) {}


initializer() {
    
    this.ws.on("message",async(data) => {
        const parsedData = JSON.parse(data.toString());
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
                RoomManager.getInstance().broadCastMessage({
                  type: "user-joined",
                  as: parsedData.as,
                },this,room.name)
                break;


                case "leave_room":
                 this.id = parsedData.userId;
                 this.username = parsedData.username;
                 const currentRoom = RoomManager.getInstance().room.get(parsedData.roomId);
                 const dbRoom = await prismaClient.room.findFirst({where: {name: parsedData.roomId}})
                if(currentRoom?.players.includes(this)) {
                    RoomManager.getInstance().leaveRoom(this,parsedData.roomId);  
                    RoomManager.getInstance().broadCastMessage({
                      type: "player_left",
                      message: "room would be closed",
                      user: {username: this.username}
                    },this,parsedData.roomId);  
                  let timeOut = setTimeout(() => {
                      [...(RoomManager.getInstance().room.get(roomId)?.players! ?? []),...(RoomManager.getInstance().room.get(roomId)?.spectators! ?? [])].forEach((user) => {
                        user.ws.close()
                      })
                    },2000)
                    clearTimeout(timeOut);
                  await prismaClient.room.delete({where: {id: dbRoom?.id}})     
                }else {
                  RoomManager.getInstance().leaveRoom(this,parsedData.roomId);
                  RoomManager.getInstance().broadCastMessage({
                    type: "user_left",
                    user: {username: this.username}
                  },this,parsedData.roomId)
                 this.ws.close()
                }   
                break;

                case "player_move":
                  this.id = parsedData.userId;
                  this.username = parsedData.username;
                  const currentRoom1 = RoomManager.getInstance().room.get(parsedData.roomId);
                  if(currentRoom1) {
                      if(currentRoom1?.players.includes(this)) {
                        currentRoom1.updateBoard(this,{row:parsedData.row,col:parsedData.col,symbol: parsedData.symbol});
                        RoomManager.getInstance().broadCastMessage({row:parsedData.row,col:parsedData.col,symbol: parsedData.symbol},this,parsedData.roomId);
                      }                    
                      this.send({
                        type: "player_move",
                        message: "not a player"  
                      })
                  }else {
                    return;
                  }

                
                break;


        }
    })  

}


send(payload:OutgoingMessage) {
  this.ws.send(JSON.parse(payload.toString()))
}

}