import { ITask } from "../../entities/ITask";
import { Task } from "../../schemas/taskSchema";
import { ITaskRepository } from "../interface/ITask";
import { BaseRepository } from "./BaseRepository";

export class TaskRepository
  extends BaseRepository<ITask>
  implements ITaskRepository
{
  constructor() {
    super(Task);
  }
}
