import { Request, Response, NextFunction } from "express";
import { TaskStatus } from "../../entities/ITask";
import TaskService from "../../services/implementation/TaskService";
import { ITaskService } from "../../services/interface/ITaskService";
import { ITaskController } from "../interface/ITaskControllers";
import { sendResponse } from "../../utils/sendResponse";
import AppError from "../../errors/appError";
import { errorMap, ErrorType } from "../../constants/response.failture";
import { catchAsync } from "../../errors/catchAsyc";

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
        throw new AppError("Failed creating task", 500);
      }
    }
  );

  editTaskHandler = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { taskId } = req.params;
      const updated = await this.TaskService.updateTask(taskId, req.body);
      if (updated) {
        return sendResponse(res, 201, "Task updated succesfully", updated);
      } else {
        throw new AppError("Failed updating task", 500);
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
              errorMap[ErrorType.BadRequest].message,
              errorMap[ErrorType.BadRequest].code
            );
          }

          updated = await this.TaskService.updateTaskQuery(taskId, updateData);
          break;
        case "assignee":
          if (!updateData.assignee) {
            throw new AppError(
              errorMap[ErrorType.BadRequest].message,
              errorMap[ErrorType.BadRequest].code
            );
          }
          updated = await this.TaskService.updateTaskQuery(taskId, updateData);
          break;

        default:
          throw new AppError("Invalid update type", 400);
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
      const field = req.query.field;
      const value = req.query.value;

      if (typeof field !== "string" || typeof value !== "string") {
        throw new AppError(
          errorMap[ErrorType.BadRequest].message,
          errorMap[ErrorType.BadRequest].code
        );
      }

      const allowedFields = ["spaceId", "assignee", "creatorId"];
      if (!allowedFields.includes("" + field)) {
        throw new AppError("Invalid query", 400);
      }

      const query: Record<string, string> = {};
      query[field] = value;
      const result = await this.TaskService.getTasksQuery(query);
      if (result) {
        return sendResponse(
          res,
          200,
          "Fetched succesfully the task with query" + query,
          result
        );
      } else {
        throw new AppError("Failed fetching tasks", 500);
      }
    }
  );
}

export default new TaskController(TaskService);
