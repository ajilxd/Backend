import { NextFunction, Request, Response } from "express";

export interface ITaskController {
  addTaskHandler(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> | void;

  editTaskHandler(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> | void;

  getTasksByField(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> | void;

  updateTaskByField(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> | void;
}
