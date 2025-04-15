import { ErrorCode } from "../custom/types";


export class HttpError extends Error {
    message: string;
    statusCode: number;
    success: boolean;
    errorCode: ErrorCode;
    error:any
  
    constructor(message:string,statusCode:number,errorCode:ErrorCode,errors: any,success: boolean) {
        super(message)
        this.message = message;
        this.statusCode = statusCode;
        this.success = success;
        this.errorCode = errorCode;
        this.error = errors
    }
}