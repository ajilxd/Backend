import { ObjectId, Document } from "mongoose";

export interface ICompany extends Document {
  _id: ObjectId;
  industry: Array<string>;
  ownerId: ObjectId;
  companyName: string;
  websiteURL: string;
  description: string;
}
