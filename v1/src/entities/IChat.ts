import { ObjectId, Document } from "mongoose";

export interface IChat extends Document {
  _id: ObjectId;
  senderId: string;
  senderName: string;
  senderImageUrl: string;
  room: string;
  content: string;
  createdAt: {};
  updatedAt: Date;
}
