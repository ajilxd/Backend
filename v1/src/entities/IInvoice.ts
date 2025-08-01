import { Document } from "mongoose";

export interface IInvoice extends Document {
  _id: string;
  createdAt?: Date;
  updatedAt?: Date;
  invoiceId: string;
  subscriptionName: string;
  customerEmail: string;
  customerName: string;
  customerId: string;
  currency: "inr";
  subscriptionId: string;
  amount: number;
}
