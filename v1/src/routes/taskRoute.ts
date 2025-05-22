import { Router } from "express";
import TaskController from "../controllers/implementation/TaskController";

export const taskRouter = Router();

taskRouter.post("/", TaskController.addTaskHandler);
taskRouter.put("/", TaskController.editTaskHandler);
taskRouter.get("/", TaskController.getTasksByField);
taskRouter.delete("/:taskId", TaskController.updateTaskByField);
