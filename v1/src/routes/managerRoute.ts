import { Router } from "express";
import managerController from "../controllers/implementation/ManagerController";
import authMiddleware from "../middleware/auth";
import CompanyController from "../controllers/implementation/CompanyController";
export const managerRouter = Router();

managerRouter.get(
  "/",
  authMiddleware(["manager"]),
  managerController.getManagersByFieldHandler
);

managerRouter.put(
  "/profile",
  authMiddleware(["manager"]),
  managerController.updateProfile
);
managerRouter.post(
  "/users",
  authMiddleware(["manager"]),
  managerController.addUser
);
managerRouter.get(
  "/users/:id",
  authMiddleware(["manager"]),
  managerController.getUsersByManager
);
managerRouter.patch(
  "/users/:id",
  authMiddleware(["manager"]),
  managerController.toggleUserStatus
);
managerRouter.get(
  "/logout",
  authMiddleware(["manager"]),
  managerController.logoutHandler
);

managerRouter.get(
  "/notifications",
  authMiddleware(["manager"]),
  managerController.getNotificationsHandler
);

managerRouter.get(
  "/members/:id",
  authMiddleware(["manager"]),
  CompanyController.getCompanyMembers
);

managerRouter.get(
  "/peermessages",
  authMiddleware(["manager"]),
  managerController.getMessagesHandler
);

managerRouter.get(
  "/peerchats",
  authMiddleware(["manager"]),
  managerController.getChatsHandler
);

managerRouter.get(
  "/events/:managerId",
  managerController.getCalendarEventsHandler
);
