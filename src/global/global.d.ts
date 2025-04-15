import { Role } from "../generated/prisma"

declare namespace Express {
   export interface Request {
            user?: {
                id: number,
                username: string,
                role: Role
            } | undefined
        }
}