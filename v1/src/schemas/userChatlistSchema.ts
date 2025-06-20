import mongoose, { Schema } from "mongoose";
import { IUserChatlist } from "../entities/IUserChatlist";

const ParticipantSchema = new Schema(
  {
    name: { type: String, required: true },
    image: { type: String, required: true },
    userId: { type: String, required: true },
  },
  { _id: false }
);

const ChatSchema: Schema<IUserChatlist> = new mongoose.Schema(
  {
    chatId: {
      type: String,
      required: true,
      unique: true,
    },
    participants: {
      type: [ParticipantSchema],
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    lastMessage: {
      type: String,
    },
    lastMessageTime: {
      type: Date,
    },
  },
  { timestamps: true }
);

export const UserChatlist = mongoose.model("UserChatlist", ChatSchema);
