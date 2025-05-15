import { Router } from "express";
import ChatController from "../controllers/implementation/ChatController";

export const chatRouter = Router();

chatRouter.get("/:room", ChatController.fetchChatsByRoom);
