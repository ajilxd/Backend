import { Schema, model } from "mongoose";
import { IManager } from "../entities/IManager";
import { UserRole } from "../utils/JWT";

const ManagerSchema: Schema<IManager> = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    image: { type: String, required: false },
    spaces: [{ type: Schema.Types.ObjectId, ref: "Space", required: false }],
    ownerId: { type: Schema.Types.ObjectId, ref: "Owner", required: true },
    isBlocked: { type: Boolean, default: false, required: false },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.Manager,
    },
    refreshToken: { type: String, required: false },
    companyId: { type: Schema.Types.ObjectId, require: true },
    companyName: { type: String, required: false },
    bio: { type: String, required: false },
  },
  { timestamps: true }
);

export const Manager = model<IManager>("Manager", ManagerSchema);
