import { Model } from "mongoose";
import { ITask } from "../../entities/ITask";
import AppError from "../../errors/appError";
import { Task } from "../../schemas/taskSchema";
import { ITaskRepository } from "../interface/ITaskRepository";
import { BaseRepository } from "./BaseRepository";

export type TaskQueryType = {
  taskId?: string;
  spaceId?: string;
  "assignee.id"?: string;
  creatorId?: string;
};

export type TaskUpdateQueryType = {
  status?: string;
};

export class TaskRepository
  extends BaseRepository<ITask>
  implements ITaskRepository
{
  constructor(model: Model<ITask>) {
    super(model);
  }

  async getTaskByQuery(query: TaskQueryType): Promise<ITask[]> {
    const result = await Task.find(query);
    return result;
  }

  async updateTaskByQuery(
    taskId: string,
    updateByQuery: TaskUpdateQueryType
  ): Promise<ITask> {
    const updated = await Task.findOneAndUpdate(
      { _id: taskId },
      updateByQuery,
      { new: true }
    );

    return updated!;
  }
}

export default new TaskRepository(Task);
