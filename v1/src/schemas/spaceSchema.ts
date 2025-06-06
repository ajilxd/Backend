import { Schema, model } from "mongoose";
import {
  DesignationRole,
  ISpace,
  SpaceStatus,
  SpaceVisibility,
  TeamMemberStatus,
} from "../entities/ISpace";

const TeamMemberSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, required: true, ref: "User" },
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
      ref: "Manager",
    },
    status: {
      type: String,
      enum: TeamMemberStatus,
      required: true,
      default: TeamMemberStatus[0],
    },
    memberName: {
      type: String,
      required: true,
    },
  },
  {
    _id: false,
  }
);

const ManagersSchema = new Schema({
  managerId: String,
  managerImage: String,
  managerName: String,
  status:{
    type:String,
    default:"active"
  }
});

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
    companyId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Company",
    },
    companyName: {
      type: String,
      required: true,
    },
    managers: {
      type: [ManagersSchema],
      required: true,
      default: [],
    },
  },
  { timestamps: true }
);

export const Space = model<ISpace>("Space", SpaceSchema);
