import { IManager } from "../../entities/IManager";
import { ManagerQueryType } from "../../repositories/implementations/ManagerRepository";

export interface IManagerService {
  createManager(managerData: Partial<IManager>): Promise<IManager>;
  findManagerByEmail(email: string): Promise<IManager>;
  getManagers(ownerid: string): Promise<IManager[]>;
  updateManager(
    managerId: string,
    managerData: Partial<IManager>
  ): Promise<IManager>;
  toggleManagerStatus(email: string): Promise<IManager>;
  findManagerById(id: string): Promise<IManager>;
  getManagersQuery(query: ManagerQueryType): Promise<IManager[]>;
  fetchManagerByEmail(email: string): Promise<IManager | null>;
  getAllManagers(): Promise<IManager[]>;
}
