import { IUserRepository } from "../interface/IUserRepository";
import { IUser } from "../../entities/IUser";
import { User } from "../../schemas/userSchema";
import { BaseRepository } from "./BaseRepository";

class UserRepository extends BaseRepository<IUser> implements IUserRepository {
  constructor() {
    super(User);
  }

  async findUsersByManagerId(id: string): Promise<IUser[]> {
    return await this.model.find({ managerId: id }).exec();
  }
}

export default new UserRepository();
