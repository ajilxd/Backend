import { ObjectId, Document } from "mongoose";

export interface ITask extends Document {
  _id: ObjectId;
  spaceId: ObjectId;
  name: string;
  description: string;
  assignee: ObjectId;
  priority: "low" | "medium" | "high";
  dueDate?: Date;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}
