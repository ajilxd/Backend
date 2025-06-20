import { IUser } from "../../entities/IUser";
import { IUserRepository } from "../../repositories/interface/IUserRepository";
import { IUserService } from "../../services/interface/IUserService";
import UserRepository, {
  UserQueryType,
} from "../../repositories/implementations/UserRepository";
import AppError from "../../errors/appError";

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
      throw new AppError(`Failed to find user with id(${id})`, 404, "warn");
    }
  }

  async create(data: Partial<IUser>): Promise<IUser> {
    const result = await this.userRepository.create(data);
    if (result) {
      return result;
    } else {
      throw new AppError("Failed to create the User", 500, "error");
    }
  }

  async getUsers(): Promise<IUser[]> {
    const users = await this.userRepository.findAll();

    if (users.length === 0) {
      throw new AppError("No users found", 204, "warn");
    }

    return users;
  }

  async getUserByManagerId(managerId: string): Promise<IUser[]> {
    const results = await this.userRepository.findUsersByManagerId(managerId);
    if (results.length === 0) {
      throw new AppError(
        `Failed to fetch users with managerId(${managerId})`,
        404,
        "warn"
      );
    }

    return results;
  }

  async updateUser(id: string, user: Partial<IUser>): Promise<IUser> {
    const updated = await this.userRepository.update(id, user);
    if (!updated) {
      throw new AppError(
        `Failed to update the user with id(${id})`,
        500,
        "error"
      );
    }
    return updated;
  }

  async removeUserSpace(userId: string, spaceId: string): Promise<IUser> {
    const updated = await this.userRepository.removeSpaceFromUser(
      userId,
      spaceId
    );
    if (updated) {
      return updated;
    } else {
      throw new AppError(
        `Failed updating user space removal on user collection with userId(${userId}) of space(${spaceId})`,
        500,
        "error"
      );
    }
  }

  async getUserByemail(email: string): Promise<IUser> {
    const result = await this.userRepository.findOne({ email });
    if (result) {
      return result;
    } else {
      throw new AppError(
        `Failed to find the user with email(${email})`,
        404,
        "warn"
      );
    }
  }

  async findUserByEmail(email:string):Promise<IUser|null>{
    return await this.userRepository.findOne({email})
  }
  

  async getUsersQuery(query: UserQueryType): Promise<IUser[]> {
    const result = await this.userRepository.getUsersByQuery(query);
    return result;
  }
}

export default new UserService(UserRepository);
