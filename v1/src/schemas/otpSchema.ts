import { Schema, model } from "mongoose";
import { IOtp } from "../entities/IOtp";

const OtpSchema: Schema<IOtp> = new Schema(
  {
    email: String,
    otp: { type: String, required: true },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 300,
    },
  },
  { timestamps: true }
);

export const Otp = model<IOtp>("Otp", OtpSchema);
