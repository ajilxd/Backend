import { ObjectId, Document } from "mongoose";

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
  role: string;
  refreshToken?: string;
}
