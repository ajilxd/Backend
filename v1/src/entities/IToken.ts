import { ObjectId, Document } from "mongoose";

export interface IToken extends Document {
  _id: ObjectId;
  email: string;
  token: string;
  createdAt: Date;
  updatedAt: Date;
}
