import { ObjectId } from "mongoose";
import { IOwner } from "../../entities/IOwner";
import { IBaseRepository } from "./IBaserRepository";
import { OwnerQueryType } from "../implementations/OwnerRepository";

export interface IOwnerRepository extends IBaseRepository<IOwner> {
  blockById(id: ObjectId): Promise<IOwner | null>;
  verifyAccount(email: string): Promise<IOwner | null>;
  updationByEmail(email: string, data: object): Promise<IOwner | null>;
  findByEmail(email: string): Promise<IOwner | null>;
  resetRefreshToken(id: ObjectId): Promise<IOwner | null>;
}
