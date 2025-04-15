import { ErrorCode } from "../custom/types";
import { HttpError } from "./root";


export class UnauthorizedError extends HttpError {
   constructor(message:string,errors:any) {
          super(message,401,ErrorCode.UNAUTHORISED_EXCEPTION,errors,false)
      }
}