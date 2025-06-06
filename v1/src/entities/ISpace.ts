import { ObjectId, Document } from "mongoose";

export type MemberRoleType = "supermanager" | "manager" | "member" | "viewer";

export const MemberRole = [
  "supermanager",
  "manager",
  "member",
  "viewer",
] as const;

export type DesignationRoleType = "developer" | "tester" | "designer";

export const DesignationRole = ["developer", "tester", "designer"] as const;

export type TeamMemberStatusType = "active" | "pending" | "removed";

export const TeamMemberStatus = ["active", "pending", "removed"] as const;

export type SpaceStatusType = "active" | "archived" | "deleted";

export const SpaceStatus = ["active", "archived", "deleted"] as const;

export type SpaceVisibilityType = "private" | "team" | "public";

export const SpaceVisibility = ["private", "team", "public"] as const;

export type TeamMember = {
  userId: ObjectId;
  role: MemberRoleType;
  joinedAt: Date;
  invitedBy: ObjectId;
  status: string;
  designation: DesignationRoleType;
};

export type Team = {
  members: TeamMember[];
};

export type ManagersType = {
  managerId: string;
  managerImage: string;
  managerName: string;
};

export interface ISpace extends Document {
  _id: ObjectId;
  name: string;
  description: string;
  team: Team;

  createdBy: ObjectId;
  owner: ObjectId;
  createdAt: Date;
  updatedAt: Date;

  visibility: SpaceVisibilityType;
  status: SpaceStatusType;

  companyName: string;
  companyId: ObjectId;

  tags: [string];
  managers: ManagersType[];
}
