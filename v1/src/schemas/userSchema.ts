import mongoose, { Schema, Types } from "mongoose";
import { IUser } from "../entities/IUser";
import { UserRole } from "../utils/JWT";

const role = ["developer", "tester", "designer"];

const UserSchema: Schema<IUser> = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    image: { type: String },
    spaces: { type: [Schema.Types.ObjectId], required: false, default: [] },
    isAvailable: { type: Boolean, default: true },
    isBlocked: { type: Boolean, default: false },
    role: {
      type: String,
      enum: role,
      default: UserRole.User,
    },
    managerId: { type: Schema.Types.ObjectId, ref: "Manager", required: true },
    managerName: { type: String, required: false },
    bio: { type: String, required: false },
    refreshToken: { type: String, required: false },
    ownerId: { type: Schema.Types.ObjectId, required: false },
    companyId: { type: Schema.Types.ObjectId, required: true },
    companyName: { type: String, required: false },
  },
  {
    timestamps: true,
  }
);

export const User = mongoose.model<IUser>("User", UserSchema);
