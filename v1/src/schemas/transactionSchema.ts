import mongoose, { Schema } from "mongoose";
import { ITransaction } from "../entities/ITransaction";

const transactionSchema: Schema<ITransaction> = new mongoose.Schema({
  customerName: {
    type: String,
    required: true,
  },
  subscriptionName: {
    type: String,
    required: true,
  },
  subscribedDate: {
    type: String,
    requried: true,
  },
  expiryDate: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  companyName: {
    type: String,
    required: true,
  },
  stripeSubsriptionId: String,
  stripeCustomerId: String,
});

export const Transaction = mongoose.model("Transaction", transactionSchema);
