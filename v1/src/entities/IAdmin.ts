import { ObjectId, Document } from "mongoose";
import { UserRole } from "../utils/JWT";

export interface IAdmin extends Document {
  _id: ObjectId;
  email: string;
  password: string;
  refreshToken: string;
  role: UserRole;
}
