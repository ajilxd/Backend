import { ObjectId, Document } from "mongoose";
import { UserRole } from "../utils/JWT";

export interface IManager extends Document {
  _id: ObjectId;
  name: string;
  email: string;
  image?: string;
  spaces?: ObjectId[];
  ownerId: ObjectId;
  isBlocked?: Boolean;
  createdAt: Date;
  updatedAt: Date;
  role: UserRole;
  refreshToken?: string;
}
