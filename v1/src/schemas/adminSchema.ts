import { Schema, model } from "mongoose";
import { IAdmin } from "../entities/IAdmin";
import { UserRole } from "../utils/JWT";

const AdminSchema: Schema<IAdmin> = new Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    refreshToken: {
      type: String,
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.Admin,
    },
  },
  { timestamps: true }
);

export const Admin = model<IAdmin>("Admin", AdminSchema);
