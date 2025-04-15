import { Router } from "express";
import { getProfile, signin, signup } from "../../controller/auth/auth";
import { responseHandler } from "../../middleware/custom.middleware";
import authMiddleware from "../../middleware/auth.middleware";

const authRouter:Router = Router();

authRouter.post("/signup",responseHandler(signup))
authRouter.post("/signin",responseHandler(signin))
authRouter.get("/get-user-profile",authMiddleware,getProfile)

export default authRouter;