import { IManager } from "../../entities/IManager";
import { IBaseRepository } from "./IBaserRepository";

export interface IManagerRepository extends IBaseRepository<IManager> {
  getManagers(id: string): Promise<IManager[]>;
}
