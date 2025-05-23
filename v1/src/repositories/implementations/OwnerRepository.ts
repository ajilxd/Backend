import { IOwnerRepository } from "../interface/IOwnerRepository";
import { IOwner } from "../../entities/IOwner";
import { Owner } from "../../schemas/ownerSchema";
import { ObjectId } from "mongoose";

import { BaseRepository } from "./BaseRepository";
import AppError from "../../errors/appError";

export type OwnerQueryType = {
  spaces?: string;
  _id?: string;
};

class OwnerRepository
  extends BaseRepository<IOwner>
  implements IOwnerRepository
{
  constructor() {
    super(Owner);
  }
  async blockById(id: ObjectId): Promise<IOwner | null> {
    return await Owner.findByIdAndUpdate(
      id,
      { isBlocked: true },
      { new: true }
    ).exec();
  }
  async verifyAccount(email: string): Promise<IOwner | null> {
    console.log("lets debug this together");

    const updatedOwner = await Owner.findOneAndUpdate(
      { email },
      { $set: { isVerified: true } },
      { new: true }
    );

    return updatedOwner;
  }

  async updationByEmail(email: string, data: object): Promise<IOwner | null> {
    const updatedData = await Owner.findOneAndUpdate({ email }, data);
    return updatedData;
  }

  async findByEmail(email: string): Promise<IOwner | null> {
    return await Owner.findOne({ email });
  }

  async getOwnersByQuery(query: OwnerQueryType): Promise<IOwner[]> {
    const result = await this.model.find(query);
    if (!result.length) {
      throw new AppError("No owners found", 404);
    }
    return result;
  }
}

export default new OwnerRepository();
