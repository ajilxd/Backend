import { ObjectId, Document } from "mongoose";

type MemberRole = "supermanager" | "manager" | "member" | "viewer";

type TeamMember = {
  userId: ObjectId;
  role: MemberRole;
  joinedAt: Date;
  invitedBy?: ObjectId;
  status: "active" | "pending" | "removed";
};

type Team = {
  members: TeamMember[];
};

export interface ISpace extends Document {
  _id: ObjectId;
  name: string;
  description?: string;
  team: Team;

  createdBy: ObjectId;
  owner: ObjectId;
  createdAt: Date;
  updatedAt: Date;

  visibility: "private" | "team" | "public";
  status: "active" | "archived" | "deleted";

  tags?: string[];
}
