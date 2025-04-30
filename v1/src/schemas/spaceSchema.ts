import { Schema, model } from "mongoose";
import {
  DesignationRole,
  ISpace,
  SpaceStatus,
  SpaceVisibility,
  TeamMemberStatus,
} from "../entities/ISpace";
import { MemberRole } from "../entities/ISpace";

const TeamMemberSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, required: true, ref: "User" },
    role: {
      type: String,
      enum: MemberRole,
      required: true,
      default: MemberRole[0],
    },
    designation: {
      type: String,
      enum: DesignationRole,
      required: true,
      default: DesignationRole[0],
    },
    joinedAt: {
      type: Date,
      required: true,
    },
    invitedBy: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Owner",
    },
    status: {
      type: String,
      enum: TeamMemberStatus,
      required: true,
      default: TeamMemberStatus[0],
    },
  },
  {
    _id: false,
  }
);

const SpaceSchema: Schema<ISpace> = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    team: {
      members: { type: [TeamMemberSchema] },
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    spaceOwner: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    visibility: {
      type: String,
      enum: SpaceVisibility,
      required: true,
      default: SpaceVisibility[0],
    },
    status: {
      type: String,
      enum: SpaceStatus,
      required: true,
      default: SpaceStatus[0],
    },
    tags: {
      type: [String],
      required: true,
      default: [],
    },
  },
  { timestamps: true }
);

export const Space = model<ISpace>("Space", SpaceSchema);
