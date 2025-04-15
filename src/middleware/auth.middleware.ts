import { Request,Response,NextFunction } from "express"
import * as Jwt from "jsonwebtoken";
import { UnauthorizedError } from "../exceptions/unauthorized";
import { JWT_SECRET } from "../custom/secret";
import { UserJwtPayload } from "../custom/types";
import { extractToken, IGetUserAuthInfoRequest } from "./custom.middleware";


 const authMiddleware = (req:IGetUserAuthInfoRequest,res:Response,next:NextFunction) => {
 let token = extractToken(req);
 if(!token) {
  throw new UnauthorizedError("Not authorized",null)
 }
  try {
    const userPayload = Jwt.verify(token,(JWT_SECRET) as string) as UserJwtPayload;
    req.user = userPayload;
    next()
  } catch (error) {
    throw new UnauthorizedError("Not authorized",null)
  }
}



export default authMiddleware;