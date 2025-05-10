import { ObjectId, Document } from "mongoose";
import { UserRole } from "../utils/JWT";

export interface IUser extends Document {
  _id: ObjectId;
  name: string;
  email: string;
  image?: string;
  managerId: ObjectId;
  spaces: ObjectId[];
  isAvailable: Boolean;
  isBlocked: Boolean;
  role: UserRole;
  refreshToken?: string;
  ownerId: ObjectId;
  companyId: ObjectId;
}
