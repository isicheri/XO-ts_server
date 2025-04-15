import { Router } from "express";
import authMiddleware from "../../middleware/auth.middleware";
import { responseHandler } from "../../middleware/custom.middleware";
import { createRoom, deleteRoomById, getRoomById } from "../../controller/room/room";

const roomRouter:Router = Router();

roomRouter.use(authMiddleware)

roomRouter.post("/create-room",responseHandler(createRoom))
roomRouter.get("/get-room",responseHandler(getRoomById))
roomRouter.delete("/delete-room",responseHandler(deleteRoomById))

export default roomRouter;