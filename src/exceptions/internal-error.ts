import { ErrorCode } from "../custom/types";
import { HttpError } from "./root";


export class InternalError extends HttpError {
    constructor(message:string,error:any) {
        super(message,500,ErrorCode.INTERNAL_ERROR,error,false)
    }
}