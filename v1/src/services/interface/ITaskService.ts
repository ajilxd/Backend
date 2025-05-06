import { NextFunction, Request } from "express";
import { ITask } from "../../entities/ITask";

import {
  TaskQueryType,
  TaskUpdateQueryType,
} from "../../repositories/implementations/TaskRepository";

export interface ITaskService {
  createTask(data: Partial<ITask>): Promise<ITask>;
  updateTask(taskId: string, updateData: Partial<ITask>): Promise<ITask>;
  getTasksQuery(query: TaskQueryType): Promise<ITask[]>;
  updateTaskQuery(
    taskId: string,
    updateQuery: TaskUpdateQueryType
  ): Promise<ITask>;
}
