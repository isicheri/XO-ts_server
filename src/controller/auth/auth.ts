import { NextFunction, Request,Response } from "express";
import { CreateUserSchema, LoginUserSchema } from "../../validation/validation";
import { prismaClient } from "../..";
import * as bcrypt from "bcrypt"
import * as Jwt from "jsonwebtoken"
import { UnproccessableEntity } from "../../exceptions/validation-excetion";
import { BadRequestError } from "../../exceptions/bad-request";
import { JWT_SECRET } from "../../custom/secret";


export const signup = async (req:Request,res:Response,next:NextFunction) => {
       const parsedbody =  CreateUserSchema.safeParse(req.body);
       if(!parsedbody.success){
        throw new UnproccessableEntity("invalid input!",parsedbody.error);
       }
       const user = await prismaClient.user.findFirst({where: {username: parsedbody.data.username}});
      if(user) {
        throw new BadRequestError("A user with that username already exist!",null);
      }
      let hashedPass = bcrypt.hash(parsedbody.data.password,10);
      const newUser = await prismaClient.user.create({
         data: {username: parsedbody.data.username,password: await (hashedPass)}
      })
      res.json({
        message: "user created successfully",
        success: true,
        data: {
            username: newUser.username
        }
      })
}

export const signin = async (req:Request,res:Response,next:NextFunction) => {
    const parsedbody = LoginUserSchema.safeParse(req.body);
    if(!parsedbody.success){
        throw new UnproccessableEntity("invalid input!",parsedbody.error);
       }
const user = await prismaClient.user.findUnique({
    where: {
        username: parsedbody.data.username
    }
})
if(!user) {
    throw new BadRequestError("user not found",null)
}
const validPassword = checkPassword(parsedbody.data.password)(user.password);
if(!validPassword) {
    throw new BadRequestError("password incorrect!",null);
}
const accessToken = Jwt.sign({id: user.id,username:user.username,role:user.role},(JWT_SECRET) as string,{expiresIn: "1hr"})
res.json({
    message: "login successful!",
    success: true,
    data: {
        id: user.id,
        username:user.username
    },
    accessToken: accessToken
})
}


export const getProfile = (req:Request,res:Response) => {
    res.send("user logged in");
}

const checkPassword = (password:string) => {
return (hashedPassword: string): boolean => {
const decryptPassword = bcrypt.compareSync(password,hashedPassword);
if(decryptPassword) {
    return true;
}
return false;
}
}