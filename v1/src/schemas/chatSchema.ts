import { Schema, model } from "mongoose";
import { IChat } from "../entities/IChat";
const ChatSchema: Schema<IChat> = new Schema(
  {
    senderId: String,
    senderName: String,
    senderImageUrl: String,
    room: String,
    content: String,
  },
  { timestamps: true }
);

export const Chat = model<IChat>("Chat", ChatSchema);
