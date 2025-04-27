import { Schema, model } from "mongoose";
import { IToken } from "../entities/IToken";

const TokenSchema: Schema<IToken> = new Schema(
  {
    email: { type: String },
    token: { type: String, required: true },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 300,
    },
  },
  { timestamps: true }
);

export const Token = model<IToken>("Token", TokenSchema);
