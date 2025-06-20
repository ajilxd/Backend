import { IUser } from "../../entities/IUser";
import { IBaseRepository } from "./IBaserRepository";
import { UserQueryType } from "../implementations/UserRepository";

export interface IUserRepository extends IBaseRepository<IUser> {
  findUsersByManagerId(id: string): Promise<IUser[]>;
  getUsersByQuery(query: UserQueryType): Promise<IUser[]>;
  resetRefreshToken(id: string): Promise<IUser | null>;
  removeSpaceFromUser(userId: string, spaceId: string): Promise<IUser | null>;
}
