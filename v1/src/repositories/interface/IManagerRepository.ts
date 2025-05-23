import { IManager } from "../../entities/IManager";
import { ManagerQueryType } from "../implementations/ManagerRepository";
import { IBaseRepository } from "./IBaserRepository";

export interface IManagerRepository extends IBaseRepository<IManager> {
  getManagers(id: string): Promise<IManager[]>;
  getManagersByQuery(query: ManagerQueryType): Promise<IManager[]>;
}
