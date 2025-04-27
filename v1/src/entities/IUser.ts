import { ObjectId, Document } from "mongoose";

export interface IUser extends Document {
  _id: ObjectId;
  name: String;
  email: String;
  image?: String;
  managerId: ObjectId;
  spaceId: String;
  isAvailable: Boolean;
  isBlocked: Boolean;
  role: string;
  refreshToken?: string;
  ownerId?: string;
}
