import { ObjectId, Document } from "mongoose";

export interface IAdmin extends Document {
  _id: ObjectId;
  email: string;
  password: string;
  refreshToken: string;
  role?: string;
}
