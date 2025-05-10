import { IUser } from "../../entities/IUser";
import { IUserRepository } from "../../repositories/interface/IUserRepository";
import { IUserService } from "../../services/interface/IUserService";
import UserRepository, {
  UserQueryType,
} from "../../repositories/implementations/UserRepository";
import AppError from "../../errors/appError";
import { errorMap, ErrorType } from "../../constants/response.failture";
import { successMap, SuccessType } from "../../constants/response.succesful";

class UserService implements IUserService {
  private userRepository: IUserRepository;
  constructor(userRepository: IUserRepository) {
    this.userRepository = userRepository;
  }

  async getUserById(id: string): Promise<IUser> {
    const result = await this.userRepository.findOne({ _id: id });
    if (result) {
      return result;
    } else {
      throw new AppError(
        errorMap[ErrorType.NotFound].message,
        errorMap[ErrorType.NotFound].code
      );
    }
  }

  async create(data: Partial<IUser>): Promise<IUser> {
    const result = await this.userRepository.create(data);
    if (result) {
      return result;
    } else {
      throw new AppError(
        errorMap[ErrorType.ServerError].message,
        errorMap[ErrorType.ServerError].code
      );
    }
  }

  async getUsers(): Promise<IUser[]> {
    const users = await this.userRepository.findAll();
    if (!users.length) {
      throw new AppError(
        errorMap[ErrorType.NotFound].message,
        errorMap[ErrorType.NotFound].code
      );
    }

    if (users.length === 0) {
      throw new AppError(
        successMap[SuccessType.NoContent].message,
        successMap[SuccessType.NoContent].code
      );
    }

    return users;
  }

  async getUserByManagerId(managerId: string): Promise<IUser[]> {
    const results = await this.userRepository.findUsersByManagerId(managerId);
    if (!results) {
      throw new AppError(
        errorMap[ErrorType.NotFound].message,
        errorMap[ErrorType.NotFound].code
      );
    }

    if (results.length == 0) {
      throw new AppError(
        successMap[SuccessType.NoContent].message,
        successMap[SuccessType.NoContent].code
      );
    }

    return results;
  }

  async updateUser(id: string, user: Partial<IUser>): Promise<IUser> {
    const updated = await this.userRepository.update(id, user);
    if (!updated) {
      throw new AppError(
        errorMap[ErrorType.BadRequest].message,
        errorMap[ErrorType.BadRequest].code
      );
    }
    return updated;
  }

  async getUserByemail(email: string): Promise<IUser> {
    const result = await this.userRepository.findOne({ email });
    if (result) {
      return result;
    } else {
      throw new AppError(
        errorMap[ErrorType.NotFound].message,
        errorMap[ErrorType.NotFound].code
      );
    }
  }

  async getUsersQuery(query: UserQueryType): Promise<IUser[]> {
    const result = await this.userRepository.getUsersByQuery(query);
    return result;
  }
}

export default new UserService(UserRepository);
