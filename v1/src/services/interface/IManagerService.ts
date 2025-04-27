import { IManager } from "../../entities/IManager";

export interface IManagerService {
  createManager(managerData: any): Promise<IManager>;
  findManagerByEmail(email: string): Promise<IManager>;
  getManagers(id: string): Promise<IManager[]>;
  updateManager(
    email: string,
    managerData: Partial<IManager>
  ): Promise<IManager>;
  toggleManagerStatus(email: string): Promise<IManager>;
  findManagerById(id: string): Promise<IManager>;
}
