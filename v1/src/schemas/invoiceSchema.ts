import { model, Mongoose, Schema } from "mongoose";
import { IInvoice } from "../entities/IInvoice";

const invoiceSchema: Schema<IInvoice> = new Schema(
  {
    invoiceId: { type: String, required: true },
    subscriptionId: { type: String, required: true },
    subscriptionName: { type: String, required: true },
    amount: { type: Number, required: true },
    currency: { type: String, required: true },
    customerEmail: { type: String, required: true },
    customerName: { type: String, required: true },
    customerId: { type: String, required: true },
  },
  { timestamps: true }
);

export const Invoice = model<IInvoice>("Invoice", invoiceSchema);
