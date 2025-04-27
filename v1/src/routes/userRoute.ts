import { Router } from "express";
import UserController from "../controllers/implementation/UserController";
import authMiddleware from "../middleware/auth";

export const userRouter = Router();

userRouter.get("/logout", UserController.logoutHandler);
