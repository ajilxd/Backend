import { Schema, model } from "mongoose";
import { IDoc } from "../entities/IDoc";

const DocSchema: Schema<IDoc> = new Schema(
  {
    spaceid: { type: Schema.Types.ObjectId, ref: "Space", required: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    comments: { type: Object, required: false },
  },
  { timestamps: true }
);

export const Doc = model<IDoc>("Doc", DocSchema);
