import { ITask } from "../../entities/ITask";
import { IBaseRepository } from "./IBaserRepository";

export interface ITaskRepository extends IBaseRepository<ITask> {}
