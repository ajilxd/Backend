import { Schema, model } from "mongoose";
import { INotification } from "../entities/INotification";

const NotificationSchema: Schema<INotification> = new Schema(
  {
    companyId: {
      type: String,
      required: true,
    },
    targetSpaceId: {
      type: String,
    },
    notificationContent: {
      type: String,
      required: true,
    },
    notificationTimeStamp: {
      type: String,
    },
    notificationType: {
      type: String,
    },
    notificationSenderId: String,
  },
  { timestamps: true }
);

export const Notification = model<INotification>(
  "Notification",
  NotificationSchema
);
