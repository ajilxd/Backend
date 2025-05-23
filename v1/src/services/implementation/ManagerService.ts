import { IManagerRepository } from "../../repositories/interface/IManagerRepository";
import ManagerRepository, {
  ManagerQueryType,
} from "../../repositories/implementations/ManagerRepository";
import { IManager } from "../../entities/IManager";
import { IManagerService } from "../interface/IManagerService";

import { IUserRepository } from "../../repositories/interface/IUserRepository";
import UserRepository from "../../repositories/implementations/UserRepository";

import AppError from "../../errors/appError";
import { errorMap, ErrorType } from "../../constants/response.failture";

import { successMap, SuccessType } from "../../constants/response.succesful";

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
        errorMap[ErrorType.NotFound].message,
        errorMap[ErrorType.NotFound].code
      );
    return result;
  }

  async findManagerById(id: string): Promise<IManager> {
    const result = await this.managerRepository.findOne({ _id: id });
    if (!result)
      throw new AppError(
        errorMap[ErrorType.NotFound].message,
        errorMap[ErrorType.NotFound].code
      );
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
        throw new AppError(
          errorMap[ErrorType.ServerError].message,
          errorMap[ErrorType.ServerError].code
        );
      return updated;
    } else {
      throw new AppError(
        errorMap[ErrorType.NotFound].message,
        errorMap[ErrorType.NotFound].code
      );
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
          errorMap[ErrorType.ServerError].message,
          errorMap[ErrorType.ServerError].code
        );
      }
      return updated;
    } else {
      throw new AppError(
        errorMap[ErrorType.NotFound].message,
        errorMap[ErrorType.NotFound].code
      );
    }
  }

  async getManagers(ownerId: string): Promise<IManager[]> {
    const managers = await this.managerRepository.getManagers(ownerId);
    if (!managers.length) {
      throw new AppError(
        errorMap[ErrorType.NotFound].message,
        errorMap[ErrorType.NotFound].code
      );
    }
    if (managers.length > 0) {
      return managers;
    } else {
      throw new AppError(
        successMap[SuccessType.NoContent].message,
        successMap[SuccessType.NoContent].code
      );
    }
  }

  async getManagersQuery(query: ManagerQueryType): Promise<IManager[]> {
    const result = await this.managerRepository.getManagersByQuery(query);
    return result;
  }
}
export default new ManagerService(ManagerRepository, UserRepository);
