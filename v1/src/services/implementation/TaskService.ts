import { Request, NextFunction } from "express";
import { ITask } from "../../entities/ITask";
import { ITaskService } from "../interface/ITaskService";
import { ITaskRepository } from "../../repositories/interface/ITaskRepository";
import { ISpaceRepository } from "../../repositories/interface/ISpaceRepository";
import AppError from "../../errors/appError";
import TaskRepository, {
  TaskQueryType,
  TaskUpdateQueryType,
} from "../../repositories/implementations/TaskRepository";
import SpaceRepository from "../../repositories/implementations/SpaceRepository";

class TaskService implements ITaskService {
  private TaskRepository: ITaskRepository;
  private SpaceRepository: ISpaceRepository;
  constructor(
    TaskRepository: ITaskRepository,
    SpaceRepository: ISpaceRepository
  ) {
    this.TaskRepository = TaskRepository;
    this.SpaceRepository = SpaceRepository;
  }
  async createTask(data: Partial<ITask>): Promise<ITask> {
    const result = await this.TaskRepository.create(data);
    return result;
  }

  async updateTask(taskId: string, updateData: Partial<ITask>): Promise<ITask> {
    const updated = await this.TaskRepository.update(taskId, updateData);
    if (updated) {
      return updated;
    } else {
      throw new AppError("Failed updating Task", 500, "error");
    }
  }

  async getTasksQuery(query: TaskQueryType): Promise<ITask[]> {
    const result = await this.TaskRepository.getTaskByQuery(query);
    return result;
  }

  async updateTaskQuery(
    taskId: string,
    updateQuery: TaskUpdateQueryType
  ): Promise<ITask> {
    const updated = await this.TaskRepository.updateTaskByQuery(
      taskId,
      updateQuery
    );
    if (updated) {
      return updated;
    } else {
      throw new AppError(
        "Failed updating space collection with query" + updateQuery,
        500,
        "error"
      );
    }
  }
}

export default new TaskService(TaskRepository, SpaceRepository);
