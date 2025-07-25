import mongoose, { Schema } from "mongoose";
import { IUserChatlist } from "../entities/IUserChatlist";

const ParticipantsMetadata = new mongoose.Schema({
  name:String,
  email:String,
  image:String,
  userId:String,
  role:String,
  status:String,
  lastSeen:Date
},{_id:false})

const ChatSchema: Schema<IUserChatlist> = new mongoose.Schema(
  {
    chatId: {
      type: String,
      required: true,
      unique: true,
    },
    participants: {
      type: [String, String],
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
    participantsMetadata:[ParticipantsMetadata,ParticipantsMetadata]
  },
  { timestamps: true }
);

export const UserChatlist = mongoose.model("UserChatlist", ChatSchema);
