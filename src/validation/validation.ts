import { z } from "zod";


export const CreateUserSchema = z.object({
    username: z.string().max(8,{message: "Username must be 8 or fewer characters long" }),
    password: z.string().max(6,{message: "password must be 6 or fewer characters long"})
})

export const LoginUserSchema = z.object({
    username: z.string(),
    password: z.string()
})

export const UpdateUsernameSchema = z.object({
     username: z.string().max(8,{message: "Username must be 8 or fewer characters long" }),
})


export const CreateRoomSchema = z.object({
    name: z.string().max(8,{message: "password must be 6 or fewer characters long"})
})