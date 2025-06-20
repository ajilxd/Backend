import { IOwnerRepository } from "../interface/IOwnerRepository";
import { IOwner } from "../../entities/IOwner";
import { Owner } from "../../schemas/ownerSchema";
import { Model, ObjectId } from "mongoose";

import { BaseRepository } from "./BaseRepository";

export type OwnerQueryType = {
  spaces?: string;
  _id?: string;
};

class OwnerRepository
  extends BaseRepository<IOwner>
  implements IOwnerRepository
{
  constructor(model: Model<IOwner>) {
    super(model);
  }

  blockById(id: ObjectId): Promise<IOwner | null> {
    return this.model
      .findByIdAndUpdate(id, { isBlocked: true }, { new: true })
      .exec();
  }
  verifyAccount(email: string): Promise<IOwner | null> {
    return this.model.findOneAndUpdate(
      { email },
      { $set: { isVerified: true } },
      { new: true }
    );
  }

  updationByEmail(email: string, data: object): Promise<IOwner | null> {
    return this.model.findOneAndUpdate({ email }, data);
  }

  findByEmail(email: string): Promise<IOwner | null> {
    return this.model.findOne({ email });
  }

  resetRefreshToken(id: ObjectId): Promise<IOwner | null> {
    return this.model
      .findByIdAndUpdate(id, { refreshToken: "" }, { new: true })
      .exec();
  }
}

export default new OwnerRepository(Owner);
