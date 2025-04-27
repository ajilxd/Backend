import { Schema, model } from "mongoose";
import { INotification } from "../entities/INotification";

const NotificationSchema: Schema<INotification> = new Schema(
  {
    designation: {
      type: Schema.Types.ObjectId,
      ref: "Designation",
      required: true,
    },
    text: { type: String, required: true },
  },
  { timestamps: true }
);

export const Notification = model<INotification>(
  "Notification",
  NotificationSchema
);
