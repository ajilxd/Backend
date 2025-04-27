import { IUser } from "../../entities/IUser";
import { ObjectId } from "mongoose";
import { IBaseRepository } from "./IBaserRepository";

export interface IUserRepository extends IBaseRepository<IUser> {
  findUsersByManagerId(id: string): Promise<IUser[]>;
}
