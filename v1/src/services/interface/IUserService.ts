import { IUser } from "../../entities/IUser";
import { UserQueryType } from "../../repositories/implementations/UserRepository";

export interface IUserService {
  create(user: Partial<IUser>): Promise<IUser>;
  getUsers(): Promise<IUser[]>;
  updateUser(id: string, user: Partial<IUser>): Promise<IUser>;
  getUserByManagerId(managerId: string): Promise<IUser[]>;
  getUserById(id: string): Promise<IUser>;
  getUserByemail(email: string): Promise<IUser>;
  getUsersQuery(query: UserQueryType): Promise<IUser[]>;
  removeUserSpace(userId: string, spaceId: string): Promise<IUser>;
  findUserByEmail(email: string): Promise<IUser | null>;
}
