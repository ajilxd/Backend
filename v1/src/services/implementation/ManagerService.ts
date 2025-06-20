import { IManagerRepository } from "../../repositories/interface/IManagerRepository";
import ManagerRepository, {
  ManagerQueryType,
} from "../../repositories/implementations/ManagerRepository";
import { IManager } from "../../entities/IManager";
import { IManagerService } from "../interface/IManagerService";

import { IUserRepository } from "../../repositories/interface/IUserRepository";
import UserRepository from "../../repositories/implementations/UserRepository";

import AppError from "../../errors/appError";

class ManagerService implements IManagerService {
  private managerRepository: IManagerRepository;
  private userRepository: IUserRepository;

  constructor(
    managerRepository: IManagerRepository,
    UserRepository: IUserRepository
  ) {
    this.managerRepository = managerRepository;
    this.userRepository = UserRepository;
  }

  async createManager(managerData: any): Promise<IManager> {
    return this.managerRepository.create(managerData);
  }

  async findManagerByEmail(email: string): Promise<IManager> {
    const result = await this.managerRepository.findOne({ email });
    if (!result)
      throw new AppError(
        `No manager accound found with this email  - ${email}`,
        404,
        "warn"
      );
    return result;
  }

  async findManagerById(id: string): Promise<IManager> {
    const result = await this.managerRepository.findOne({ _id: id });
    if (!result)
      throw new AppError(`No manager found by this Id - ${id}`, 404, "warn");
    return result;
  }

  async toggleManagerStatus(email: string): Promise<IManager> {
    const existingManager = await this.managerRepository.findOne({ email });

    if (existingManager) {
      const updated = await this.managerRepository.update(
        String(existingManager._id),
        {
          isBlocked: !existingManager.isBlocked,
        }
      );
      if (!updated)
        throw new AppError(`Failed to update the Manager `, 500, "error");
      return updated;
    } else {
      throw new AppError(`No manager accound go by this email - ${email}`, 404);
    }
  }

  async updateManager(
    id: string,
    managerData: Partial<IManager>
  ): Promise<IManager> {
    const existingManager = await this.managerRepository.findOne({ _id: id });

    if (existingManager) {
      const updated = await this.managerRepository.update(id, managerData);
      if (!updated) {
        throw new AppError(
          `Failed to update the Manager of id - ${id}`,
          500,
          "error"
        );
      }
      return updated;
    } else {
      throw new AppError(`No manager account go by this Id - ${id}`, 404);
    }
  }

  async getManagers(ownerId: string): Promise<IManager[]> {
    const managers = await this.managerRepository.getManagers(ownerId);
    if (!managers.length) {
      throw new AppError(
        `No managers found with this owner Id -${ownerId}`,
        404
      );
    }

    return managers;
  }

  async getManagersQuery(query: ManagerQueryType): Promise<IManager[]> {
    const result = await this.managerRepository.find(query);
    return result;
  }
}
export default new ManagerService(ManagerRepository, UserRepository);
