import { ObjectId, Document } from "mongoose";

export interface INotification extends Document {
  _id: ObjectId;
  designation: ObjectId;
  text: string;
  createdAt: string;
  updatedAt: string;
}
