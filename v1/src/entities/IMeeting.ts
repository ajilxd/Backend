import { ObjectId } from "mongoose";

export interface IParticipant {
  participantId: string;
  name: string;
  joinedAt: Date | null;
  leftAt: Date | null;
}

export interface IMeeting extends Document {
  _id: ObjectId;
  meetingId: string;
  hostId: string;
  hostName: string;
  spaceId: string;
  isInstant: boolean;
  scheduledDate: Date | null;
  status: "upcoming" | "active" | "completed";
  participants: IParticipant[];
}
