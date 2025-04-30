import mongoose, { Schema } from "mongoose";
import { IUser } from "../entities/IUser";
import { UserRole } from "../utils/JWT";

const UserSchema: Schema<IUser> = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    image: { type: String },
    spaceId: { type: Schema.Types.ObjectId, ref: "Space", required: false },
    isAvailable: { type: Boolean, default: true },
    isBlocked: { type: Boolean, default: false },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.User,
    },
    managerId: { type: Schema.Types.ObjectId, ref: "Manager", required: true },
    refreshToken: { type: String, required: false },
    ownerId: { type: String, required: false },
  },
  {
    timestamps: true,
  }
);

export const User = mongoose.model<IUser>("User", UserSchema);
