import { ErrorCode } from "../custom/types";
import { HttpError } from "./root";


export class UnproccessableEntity extends HttpError{
    constructor(message:string,error:any) {
   super(message,422,ErrorCode.UNPROCESSABLE_ENTITY_ERROR,error,false)
    }
}