import { NextFunction, Request, Response } from "express";
import { prismaClient } from "../..";
import { CreateRoomSchema } from "../../validation/validation";
import { IGetUserAuthInfoRequest } from "../../middleware/custom.middleware";
import { UnproccessableEntity } from "../../exceptions/validation-excetion";
import { BadRequestError } from "../../exceptions/bad-request";



export const createRoom = async(req:IGetUserAuthInfoRequest,res:Response,next:NextFunction) => {
    const parsedBody = CreateRoomSchema.safeParse(req.body);
    if(!parsedBody.success) {
        throw new UnproccessableEntity("something went wrong",parsedBody.error);
    }
    const roomFound = await findRoom(parsedBody.data.name);
    if(roomFound) {throw new BadRequestError("room with this name already exist",null)}
    const room = await prismaClient.room.create({data: {
        name: parsedBody.data.name,
        user: {connect: {id: req.user?.id,username:req.user?.username}}
    }})
    await prismaClient.user.update({where: {id: req.user?.id},data: {
        ownedRooms: {
        connect: {name: room.name,id:room.id,userId:room.userId}
        }
    }})
    res.json({
        message: "room created successfully",
        success: true,
        data: {
            room: room
        }
    })
}


export const getRoomById = async(req:IGetUserAuthInfoRequest,res:Response,next:NextFunction) => {
const parsedBody = CreateRoomSchema.safeParse(req.body);
if(!parsedBody.success) {
 throw new UnproccessableEntity("something went wrong!",parsedBody.error)
}
const roomFound = await findRoom(parsedBody.data.name);
if(!roomFound) {throw new BadRequestError("room does not exist",null)} 
const room = await prismaClient.room.findFirst({where: {id:roomFound.id}})
res.json({
    message: "room successfully found",
    success: true,
    data: {
        room
    }
})
}


export const deleteRoomById = async(req:IGetUserAuthInfoRequest,res:Response,next:NextFunction) => {
    const parsedBody = CreateRoomSchema.safeParse(req.body);
    if(!parsedBody.success) {
     throw new UnproccessableEntity("something went wrong!",parsedBody.error)
    }
    const roomFound = await findRoom(parsedBody.data.name);
if(!roomFound) {throw new BadRequestError("room does not exist",null)} 
      if(roomFound.userId !== req.user?.id) {
        throw new BadRequestError("user cannot delete room",null)
      }
      await prismaClient.room.delete({where: {id: roomFound.id}})
      res.json({
        message: "room deleted successfully",
        success: true,
      })
}


const findRoom = async (name: string) => {
return await prismaClient.room.findFirstOrThrow({
    where: {
      name: name
    }
})
}