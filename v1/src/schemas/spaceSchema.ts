import { Schema, model, Types } from "mongoose";
import { ISpace } from "../entities/ISpace";

const SpaceSchema: Schema<ISpace> = new Schema(
  {
    name: { type: String, required: true },
    team: [{ type: Schema.Types.ObjectId, ref: "Team", required: false }],
    manager: { type: Schema.Types.ObjectId, ref: "Manager", required: true },
  },
  { timestamps: true }
);

export const Space = model<ISpace>("Space", SpaceSchema);
