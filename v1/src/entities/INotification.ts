import { ObjectId, Document } from "mongoose";

export interface INotification extends Document {
  _id:ObjectId;
  companyId: string;
  notificationContent: string;
  notificationTimeStamp: string; 
  notificationType: string;
  notificationSenderId?:string;
  targetSpaceId: string;
  seenSet:string[];
  createdAt: Date;
  updatedAt: Date;
}

