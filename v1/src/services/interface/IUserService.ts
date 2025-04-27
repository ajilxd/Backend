import { IUser } from "../../entities/IUser";

export interface IUserService {
  create(user: Partial<IUser>): Promise<IUser>;
  getUsers(): Promise<IUser[]>;
  updateUser(id: string, user: Partial<IUser>): Promise<IUser>;
  getUserByManagerId(managerId: string): Promise<IUser[]>;
  getUserById(id: string): Promise<IUser>;
  getUserByemail(email: string): Promise<IUser>;
}
