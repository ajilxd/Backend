import { Schema, model } from "mongoose";
import { ICompany } from "../entities/ICompany";

const CompanySchema: Schema<ICompany> = new Schema(
  {
    industry: { type: [String], required: true },
    ownerId: { type: Schema.Types.ObjectId, ref: "Owner", required: true },
    companyName: { type: String, required: true },
    websiteURL: { type: String, required: false },
    description: { type: String, required: false },
  },
  { timestamps: true }
);

export const Company = model<ICompany>("Company", CompanySchema);
