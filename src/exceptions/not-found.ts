import { ErrorCode } from "../custom/types";
import { HttpError } from "./root";



export class NotFound extends HttpError {
    constructor(massage:string,errors: any) {
        super(massage,404,ErrorCode.NOT_FOUND,errors,false);
    }
}