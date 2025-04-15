import { Router } from "express";
import authMiddleware from "../../middleware/auth.middleware";
import adminMiddleware from "../../middleware/admin.middleware";
import { responseHandler } from "../../middleware/custom.middleware";
import { changeUsernameById, changeUserOnline, findOnlineUsers, getAllUsers, getUserById } from "../../controller/user/user";

const userRouter:Router = Router();
userRouter.use(authMiddleware)
userRouter.get("/get-all-users",adminMiddleware,responseHandler(getAllUsers))
userRouter.get("/get-user",responseHandler(getUserById))
userRouter.put("/update-username",responseHandler(changeUsernameById))
userRouter.get("/update/online-status",responseHandler(changeUserOnline))
userRouter.get("/get-available-users",responseHandler(findOnlineUsers))

export default userRouter;