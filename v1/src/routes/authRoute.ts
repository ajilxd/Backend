import { Router } from "express";
import AuthController from "../controllers/implementation/AuthController";

export const authRouter = Router();

authRouter.post("/login", AuthController.login);
authRouter.post("/sendotp", AuthController.sendOtp);
authRouter.get("/logout", AuthController.logout);
