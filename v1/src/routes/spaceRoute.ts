import { Router } from "express";
import SpaceController from "../controllers/implementation/SpaceController";

export const spaceRouter = Router();

spaceRouter.post("/", SpaceController.addSpaceHandler);
spaceRouter.put("/", SpaceController.editSpaceHandler);
spaceRouter.post("/user", SpaceController.addUserHandler);
spaceRouter.put("/user", SpaceController.editUserHandler);
spaceRouter.get("/", SpaceController.getSpacesByField);
spaceRouter.put("/:spaceId", SpaceController.updateSpaceByField);
