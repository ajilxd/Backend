import { Model } from "mongoose";
import { IManager } from "../../entities/IManager";
import AppError from "../../errors/appError";
import { IManagerRepository } from "../../repositories/interface/IManagerRepository";
import { Manager } from "../../schemas/managerSchema";
import { BaseRepository } from "./BaseRepository";

export type ManagerQueryType = {
  spaces?: string;
  _id?: string;
};

class ManagerRepository
  extends BaseRepository<IManager>
  implements IManagerRepository
{
  constructor(model: Model<IManager>) {
    super(model);
  }

  getManagers(id: string): Promise<IManager[]> {
    return this.model.find({ ownerId: id });
  }

  async getManagersByQuery(query: ManagerQueryType): Promise<IManager[]> {
    const result = await this.model.find(query);
    if (!result.length) {
      throw new AppError("No users found", 404);
    }
    return result;
  }

  resetRefreshToken(id: string): Promise<IManager | null> {
    return this.model
      .findByIdAndUpdate(id, { refreshToken: "" }, { new: true })
      .exec();
  }
}

export default new ManagerRepository(Manager);
