import { IUserRepository } from "../interface/IUserRepository";
import { IUser } from "../../entities/IUser";
import { User } from "../../schemas/userSchema";
import { BaseRepository } from "./BaseRepository";
import AppError from "../../errors/appError";
import { Model, Types } from "mongoose";

export type UserQueryType = {
  spaces?: string;
  _id?: string;
};

class UserRepository extends BaseRepository<IUser> implements IUserRepository {
  constructor(model: Model<IUser>) {
    super(model);
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

  resetRefreshToken(id: string): Promise<IUser | null> {
    return this.model
      .findByIdAndUpdate(id, { refreshToken: "" }, { new: true })
      .exec();
  }

  removeSpaceFromUser(userId: string, spaceId: string): Promise<IUser | null> {
    return this.model.findOneAndUpdate(
      { _id: new Types.ObjectId(userId) },
      {
        $pull: {
          spaces: new Types.ObjectId(spaceId),
        },
      },
      { new: true }
    );
  }
}

export default new UserRepository(User);
