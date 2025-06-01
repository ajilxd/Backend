import { Router } from "express";
import SpaceController from "../controllers/implementation/SpaceController";

export const spaceRouter = Router();

spaceRouter.post("/", SpaceController.addSpaceHandler);
spaceRouter.put("/", SpaceController.editSpaceHandler);
spaceRouter.post("/users", SpaceController.addUserHandler);
spaceRouter.put("/users", SpaceController.editUserHandler);
spaceRouter.get("/", SpaceController.getSpacesByField);
spaceRouter.put("/:spaceId", SpaceController.updateSpaceByField);
