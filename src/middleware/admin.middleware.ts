import { NextFunction, Response } from "express";
import { IGetUserAuthInfoRequest } from "./custom.middleware";
import { Role } from "../custom/types";
import { UnauthorizedError } from "../exceptions/unauthorized";

const adminMiddleware = (req:IGetUserAuthInfoRequest,res:Response,next:NextFunction) => {
req.user?.role === Role.ADMIN ? next() : next(new UnauthorizedError("Not authorized admin",null))
}

export default adminMiddleware;