import { ITask } from "../../entities/ITask";
import { IBaseRepository } from "./IBaserRepository";

import {
  TaskQueryType,
  TaskUpdateQueryType,
} from "../implementations/TaskRepository";

export interface ITaskRepository extends IBaseRepository<ITask> {
  getTaskByQuery(query: TaskQueryType): Promise<ITask[]>;
  updateTaskByQuery(
    taskId: string,
    updateByQuery: TaskUpdateQueryType
  ): Promise<ITask>;
}
