import { Router } from "express";
import authRouter from "./auth/auth";
import userRouter from "./user/user";
import roomRouter from "./room/room";

const indexRouter:Router = Router();
indexRouter.use("/auth",authRouter);
indexRouter.use("/user",userRouter);
indexRouter.use("/room/",roomRouter)

export default indexRouter;