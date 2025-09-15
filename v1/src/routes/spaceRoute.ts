import { Router } from "express";
import SpaceController from "../controllers/implementation/SpaceController";
import authMiddleware from "../middleware/auth";
import { validateBody } from "../middleware/requestValidator";
import { OwnerEditSpace } from "../dtos/owner/OwnerEditSpace.dto";

export const spaceRouter = Router();

spaceRouter.post(
  "/",
  authMiddleware(["owner", "manager"]),
  SpaceController.addSpaceHandler
);
spaceRouter.put(
  "/",
  authMiddleware(["owner", "manager"]),
  validateBody(OwnerEditSpace),
  SpaceController.editSpaceHandler
);
spaceRouter.post(
  "/users",
  authMiddleware(["owner", "manager"]),
  SpaceController.addUserHandler
);
spaceRouter.put(
  "/users",
  authMiddleware(["owner", "manager"]),
  SpaceController.removeMemberHandler
);
spaceRouter.get(
  "/",
  authMiddleware(["owner", "manager", "user"]),
  SpaceController.getSpacesByField
);
spaceRouter.put(
  "/:spaceId",
  authMiddleware(["owner", "manager"]),
  SpaceController.updateSpaceByField
);
