import { ObjectId, Document } from "mongoose";

export interface IOtp extends Document {
  _id: ObjectId;
  email: string | any;
  otp: string | any;
  createdAt: {};
  updatedAt: Date;
}
