import { Request,Response,NextFunction } from "express"
import { HttpError } from "../exceptions/root"
import { ZodError } from "zod"
import { UnproccessableEntity } from "../exceptions/validation-excetion"
import { InternalError } from "../exceptions/internal-error"
import { UserJwtPayload } from "../custom/types"

export const errorMiddleware = (err: HttpError,req:Request,res:Response,next: NextFunction) => {
    res.status(err.statusCode || 500).json({
        success: false,
        message: err.message,
        errorCode: err.errorCode,
        error:err.error,
    })
}


export const requestLogger = (req:Request,res:Response,next:NextFunction) => {
const timeStamp = new Date().toISOString();
const method = req.method;
const url = req.originalUrl;
console.log(`request-time: ${timeStamp}request-method: ${method}request-url: localhost:8001/${url}`)
next()
} 

export const responseHandler = (method:Function) => {
    return async (req:Request,res:Response,next:NextFunction) => {
        try {
            await method(req,res,next);
        } catch (error) {
            let exceptions:HttpError;
            if(error instanceof HttpError) {
             exceptions = error;
            }else {
                if(error instanceof ZodError) {
               exceptions = new UnproccessableEntity("input validation error",error)
                }else {
                 exceptions = new InternalError("somthing went wrong!",error);
                }
            }
            next(exceptions);
        }
    }
}

export const extractToken = (req:Request):string | undefined => {
    const [type,token] = req.headers.authorization?.split(" ") ?? [];
    return type === "Bearer" || "Basic" ? token : undefined;
    }


export interface IGetUserAuthInfoRequest extends Request {
    user?: UserJwtPayload;
}