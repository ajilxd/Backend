import { IUserRepository } from "../interface/IUserRepository";
import { IUser } from "../../entities/IUser";
import { User } from "../../schemas/userSchema";
import { BaseRepository } from "./BaseRepository";
import AppError from "../../errors/appError";

export type UserQueryType = {
  spaceId?: string;
  _id?: string;
  creatorId?: string;
};

class UserRepository extends BaseRepository<IUser> implements IUserRepository {
  constructor() {
    super(User);
  }

  async findUsersByManagerId(id: string): Promise<IUser[]> {
    return await this.model.find({ managerId: id }).exec();
  }

  async getUsersByQuery(query: UserQueryType): Promise<IUser[]> {
    const result = await this.model.find(query);
    if (!result.length) {
      throw new AppError("No users found", 404);
    }
    return result;
  }
}

export default new UserRepository();
