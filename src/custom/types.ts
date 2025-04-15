export enum ErrorCode {
    BAD_REQUEST = 10001,
    NOT_FOUND = 10002,
    UNAUTHORISED_EXCEPTION = 10003,
    UNPROCESSABLE_ENTITY_ERROR = 10004,
    INTERNAL_ERROR = 10005,
}

export enum Role {
    USER,
    ADMIN
}

export interface UserJwtPayload  {
    id:number,
    username: string
    role: Role
}