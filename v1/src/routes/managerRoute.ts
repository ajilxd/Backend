import { Router } from "express";
import managerController from "../controllers/implementation/ManagerController";
import authMiddleware from "../middleware/auth";
export const managerRouter = Router();

managerRouter.put(
  "/profile/:id",
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
