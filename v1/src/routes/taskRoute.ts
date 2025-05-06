import { Router } from "express";
import TaskController from "../controllers/implementation/TaskController";

export const TaskRouter = Router();

TaskRouter.post("/", TaskController.addTaskHandler);
TaskRouter.put("/", TaskController.editTaskHandler);
TaskRouter.get("/", TaskController.getTasksByField);
TaskRouter.put("/:taskId", TaskController.updateTaskByField);
