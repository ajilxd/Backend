import { Schema, model } from "mongoose";
import { IMeeting, IParticipant } from "../entities/IMeeting";

const participantSchema = new Schema<IParticipant>({
  participantId: { type: String, required: true },
  name: { type: String, required: true },
  joinedAt: { type: Date, default: null },
  leftAt: { type: Date, default: null },
});

const meetingSchema = new Schema<IMeeting>({
  meetingId: { type: String, required: true, unique: true },
  hostId: { type: String, required: true },
  hostName: { type: String, required: true },
  isInstant: { type: Boolean, required: true },
  scheduledDate: { type: Date, default: null },
  spaceId: { type: String, required: true },
  status: {
    type: String,
    enum: ["upcoming", "active", "completed"],
    default: "upcoming",
  },
  participants: { type: [participantSchema], default: [] },
});

export const Meeting = model<IMeeting>("Meeting", meetingSchema);
