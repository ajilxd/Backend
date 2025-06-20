import mongoose, { Schema } from "mongoose";
import { IUserMessage } from "../entities/IUserMessage";

const userMessageSchema: Schema<IUserMessage> = new mongoose.Schema(
  {
    chatId: {
      type: String,
      required: true,
      index: true,
    },
    senderId: {
      type: String,
      required: true,
    },
    receiverId: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["text", "image", "audio", "video", "file"],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    mediaMeta: {
      contentType: String,
      size: Number,
      originalName: String,
      duration: Number,
      extension: String,
    },
    name: {
      type: String,
      required: true,
    },
    read: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export const UserMessage = mongoose.model("UserMessage", userMessageSchema);
