import { Request, Response, NextFunction } from "express";
import { TaskStatus } from "../../entities/ITask";
import TaskService from "../../services/implementation/TaskService";
import { ITaskService } from "../../services/interface/ITaskService";
import { ITaskController } from "../interface/ITaskControllers";
import { sendResponse } from "../../utils/sendResponse";
import AppError from "../../errors/appError";
import { catchAsync } from "../../errors/catchAsyc";
import mongoose from "mongoose";

class TaskController implements ITaskController {
  private TaskService: ITaskService;
  constructor(TaskService: ITaskService) {
    this.TaskService = TaskService;
  }

  addTaskHandler = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const result = await this.TaskService.createTask(req.body);
      if (result) {
        return sendResponse(res, 201, "Task created succesfully", result);
      } else {
        throw new AppError("Failed creating task", 500, "error");
      }
    }
  );

  editTaskHandler = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { taskId } = req.body;
      const updated = await this.TaskService.updateTask(taskId, req.body);
      if (updated) {
        return sendResponse(res, 200, "Task updated succesfully", updated);
      } else {
        throw new AppError("Failed updating task", 500, "error");
      }
    }
  );

  updateTaskByField = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { taskId } = req.params;
      const { updateType, updateData } = req.body;
      let updated;

      switch (updateType) {
        case "status":
          if (!updateData.status || !TaskStatus.includes(updateData.status)) {
            throw new AppError(
              "Bad reqeust - Type missing at updation",
              400,
              "warn"
            );
          }

          updated = await this.TaskService.updateTaskQuery(taskId, updateData);
          break;
        case "assignee":
          if (!updateData.assignee) {
            throw new AppError(
              "Bad request - Type missing at updation",
              400,
              "warn"
            );
          }
          updated = await this.TaskService.updateTaskQuery(taskId, updateData);
          break;

        default:
          throw new AppError("Invalid update type", 400, "warn");
      }
      if (updated) {
        return sendResponse(
          res,
          200,
          "Updated succesfully with query" + updateType,
          updated
        );
      }
    }
  );

  getTasksByField = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      let field = req.query.field;
      const value = req.query.value;

      if (typeof field !== "string" || typeof value !== "string") {
        throw new AppError(
          "Bad request - Invalid type of field and value",
          400,
          "warn"
        );
      }

      const allowedFields = ["spaceId", "userId", "creatorId", "taskId"];
      if (!allowedFields.includes("" + field)) {
        throw new AppError("Invalid query", 400, "warn");
      }

      if (field === "userId") {
        field = "assignee.id";
      }

      if (field === "taskId") {
        field = "_id";
      }
      const query: Record<string, mongoose.Types.ObjectId> = {};
      query[field] = new mongoose.Types.ObjectId(value);
      const result = await this.TaskService.getTasksQuery(query);
      if (result) {
        return sendResponse(
          res,
          200,
          "Fetched succesfully the task with query" + query,
          result
        );
      } else {
        throw new AppError(
          `No tasks found with :- ${field} and value :- ${value}`,
          404,
          "warn"
        );
      }
    }
  );
}

export default new TaskController(TaskService);
