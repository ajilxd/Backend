import { Router } from "express";
import UserController from "../controllers/implementation/UserController";

export const userRouter = Router();

userRouter.get("/logout", UserController.logoutHandler);
userRouter.put("/", UserController.updateUserHandler);
userRouter.get("/", UserController.getUsersByFieldHandler);
userRouter.get("/notifications",UserController.getNotificationsHandler)
