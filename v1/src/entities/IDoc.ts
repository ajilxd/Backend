import { ObjectId, Document } from "mongoose";

export interface IDoc extends Document {
  _id: ObjectId;
  spaceId: ObjectId;
  title: string;
  content: string;
  author: ObjectId;
  comments?: {};
  createdAt: string;
  updatedAt: string;
  seen?: boolean;
}
