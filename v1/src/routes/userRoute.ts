import { Router } from "express";
import UserController from "../controllers/implementation/UserController";
import authMiddleware from "../middleware/auth";
import CompanyController from "../controllers/implementation/CompanyController";

export const userRouter = Router();

userRouter.get("/logout", UserController.logoutHandler);
userRouter.put("/", authMiddleware(["user"]), UserController.updateUserHandler);
userRouter.get(
  "/",
  authMiddleware(["user"]),
  UserController.getUsersByFieldHandler
);
userRouter.get(
  "/notifications",
  authMiddleware(["user"]),
  UserController.getNotificationsHandler
);
userRouter.get(
  "/members/:id",
  authMiddleware(["user"]),
  CompanyController.getCompanyMembers
);

userRouter.get(
  "/peermessages",
  authMiddleware(["user"]),
  UserController.getMessagesHandler
);

userRouter.get(
  "/peerchats",
  authMiddleware(["user"]),
  UserController.getChatsHandler
);

userRouter.get("/events/:userId", UserController.getCalendarEventsHandler);
