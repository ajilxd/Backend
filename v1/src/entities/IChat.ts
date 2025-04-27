import { ObjectId, Document } from "mongoose";

export interface IChat extends Document {
  _id: ObjectId;
  sender: ObjectId;
  text: string;
  createdAt: string;
  updatedAt: string;
}
