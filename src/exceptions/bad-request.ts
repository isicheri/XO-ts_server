import { ErrorCode } from "../custom/types";
import { HttpError } from "./root";


export class BadRequestError extends HttpError {
constructor(message:string,error:any) {
        super(message,400,ErrorCode.BAD_REQUEST,error,false);
    }
}