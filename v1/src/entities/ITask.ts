import { ObjectId, Document } from "mongoose";

type File = {
  type: string;
  url: string;
  uploadeeId: string;
  uploadeeName: string;
  size: number;
  s3key: string;
};

export type TaskStatusType =
  | "todo"
  | "in_progress"
  | "review"
  | "done"
  | "cancelled";

export const TaskStatus = [
  "todo",
  "in_progress",
  "review",
  "done",
  "cancelled",
];

type AssigneeType = {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
};

export const TaskPriority = ["low", "medium", "high"];

export type TaskPriorityType = "low" | "medium" | "high";

export interface ITask extends Document {
  _id: ObjectId;

  spaceId: ObjectId;
  spaceName: string;
  creatorId: ObjectId;
  creatorName: string;

  name: string;
  description: string;
  assignee: AssigneeType;
  priority: TaskPriorityType;
  status: TaskStatusType;
  tags: string[];
  completed: boolean;
  completedAt: Date;

  files: File[];

  archived: boolean;
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}
