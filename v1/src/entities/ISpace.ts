import { ObjectId, Document } from "mongoose";

export interface ISpace extends Document {
  _id: ObjectId;
  name: string;
  team?: ObjectId[];
  manager: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}
