import { Schema, model, Types } from "mongoose";
import { ITask } from "../entities/ITask";

const TaskSchema: Schema<ITask> = new Schema(
  {
    spaceId: { type: Schema.Types.ObjectId, ref: "Space", required: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    assignee: { type: Schema.Types.ObjectId, ref: "User", required: true },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      required: true,
    },
    dueDate: { type: Date, required: false },
    status: { type: String, required: true },
  },
  { timestamps: true }
);

export const Task = model<ITask>("Task", TaskSchema);
