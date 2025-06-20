import { ObjectId } from "mongoose";
import { IAdmin } from "../../entities/IAdmin";
import { IBaseRepository } from "./IBaserRepository";

export interface IAdminRepository extends IBaseRepository<IAdmin> {
  resetRefreshToken(id: string): Promise<IAdmin | null>;
}
