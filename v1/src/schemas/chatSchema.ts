import { Schema, model } from "mongoose";
import { IChat } from "../entities/IChat";

const ChatSchema: Schema<IChat> = new Schema(
  {
    sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, required: true },
  },
  { timestamps: true }
);

export const Chat = model<IChat>("Chat", ChatSchema);
