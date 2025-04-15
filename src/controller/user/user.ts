import { NextFunction, Request,Response } from "express"
import { prismaClient } from "../.."
import { NotFound } from "../../exceptions/not-found";
import { BadRequestError } from "../../exceptions/bad-request";
import { IGetUserAuthInfoRequest } from "../../middleware/custom.middleware";
import { UpdateUsernameSchema } from "../../validation/validation";
import { UnproccessableEntity } from "../../exceptions/validation-excetion";



export const getAllUsers = async(req:Request,res:Response,next:NextFunction) => {
    const skipQuery = req.query?.skip;
    const takeQuery =  req.query?.take;
    const skip =  parseInt(skipQuery as string) || 1;
    const take =  parseInt(takeQuery as string) || 10;
    const startIndex = (skip - 1) * take;
    const count = await prismaClient.user.count();
    const results = await prismaClient.user.findMany({
    skip: startIndex,
    take: take,
    include: {ownedRooms:true,spectatedRooms: true},
    orderBy: {
        id: "desc"
    }
    });
    if (!results) {
    throw new NotFound("nothing found!",null)
    } 
    res.json({
        message: "users found",
        success: true,
        data: {
            users: results,
            count:count,
            pages: (count/take)
        }
    })
}

export const getUserById = async(req:IGetUserAuthInfoRequest,res:Response,next:NextFunction) => {
    const user = await getuser(req)
     if(!user) {
       throw new BadRequestError("user not found",null)
     }
     res.json({
        success: true,
        data: {
            user: { username:user.username,online: user.online}
        }
     })
}

export const deleteUserById = async(req:IGetUserAuthInfoRequest,res:Response,next:NextFunction) => {
    const user = await getuser(req)
     if(!user) {
       throw new BadRequestError("user not found",null)
     }
     await prismaClient.user.delete({
        where: {
            id: req.user?.id
        }
     })
     res.json({
        message: "user deleted",
        succees: true,
     })
}

export const changeUsernameById = async(req:IGetUserAuthInfoRequest,res:Response,next: NextFunction) => {
    const parsedBody = UpdateUsernameSchema.safeParse(req.body);
    if(!parsedBody.success) {
        throw new UnproccessableEntity("something went wrong!",parsedBody.error)
    }
    const user = await getuser(req)
    if(!user) {
      throw new BadRequestError("user not found",null);
    }
    const updatedUser = await prismaClient.user.update({where: {id: user.id},data:{username: parsedBody.data.username}})
    res.json({
        message: "username successfully updated",
        success: true,
        data: {
            user: {
                username: updatedUser.username,
                online: updatedUser.online
            }
        }
    })
}

export const changeUserOnline = async(req:IGetUserAuthInfoRequest,res:Response,next:NextFunction) => {
    const user = await getuser(req)
    if(!user) {
        throw new BadRequestError("user not found",null);
    }
    if (user.online === true) {
        await prismaClient.user.update({where:{id: user.id},data: {online: false}})
    }else {
        await prismaClient.user.update({where:{id: user.id},data: {online: true}})
    }
}

export const findOnlineUsers = async(req:IGetUserAuthInfoRequest,res:Response,next:NextFunction) => {
    const skipQuery = req.query?.skip;
    const takeQuery =  req.query?.take;
    const skip =  parseInt(skipQuery as string) || 1;
    const take =  parseInt(takeQuery as string) || 10;
    const startIndex = (skip - 1) * take;
    const results = await prismaClient.user.findMany({skip: startIndex,take: take, where: {online: true},include: {
        ownedRooms: true,
        spectatedRooms: true
    },
    orderBy: {
        id: "desc"
    }})
    if(!results) {
        throw new NotFound("No user is online for now",null)
    }
    res.json({
        message: "users available",
        success: true,
        data: {
            onlineUsers: results
        }
    })
}

const getuser = async(req:IGetUserAuthInfoRequest) => {
    return await prismaClient.user.findFirst({where: {id: req.user?.id}})
} 