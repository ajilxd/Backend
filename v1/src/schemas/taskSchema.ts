import { Schema, model } from "mongoose";
import { ITask, TaskPriority, TaskStatus } from "../entities/ITask";

const TaskSchema: Schema<ITask> = new Schema(
  {
    spaceId: { type: Schema.Types.ObjectId, ref: "Space", required: true },
    spaceName: { type: String, required: true },
    creatorId: { type: Schema.Types.ObjectId, required: true },
    creatorName: { type: String, required: true },

    name: { type: String, required: true },
    description: { type: String, required: true },
    assignee: { type: Schema.Types.ObjectId, ref: "User", required: true },
    priority: {
      type: String,
      enum: TaskPriority,
      required: true,
    },
    status: { type: String, enum: TaskStatus, required: true },
    dueDate: { type: Date, required: false },
    completed: { type: Boolean, default: false },
    completedAt: { type: Date },
    archived: { type: Boolean, default: false },
    tags: { type: [String], default: ["none"] },
  },
  { timestamps: true }
);

export const Task = model<ITask>("Task", TaskSchema);
