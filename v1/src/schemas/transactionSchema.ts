import mongoose, { Schema } from "mongoose";
import { ITransaction } from "../entities/ITransaction";

const transactionSchema: Schema<ITransaction> = new mongoose.Schema(
  {
    customerId: {
      type: String,
      required: true,
    },
    customerName: {
      type: String,
      required: true,
    },
    subscriptionName: {
      type: String,
      required: true,
    },
    subscribedDate: {
      type: Date,
      default: null,
    },
    expiryDate: {
      type: Date,
      default: null,
    },
    amount: {
      type: Number,
      required: true,
    },
    companyName: {
      type: String,
      required: true,
    },
    stripeSubsriptionId: {
      default: null,
      type: String,
    },
    stripeCustomerId: {
      default: null,
      type: String,
    },
    status: {
      default: "fail",
      type: String,
    },
    transactionType: {
      default: "initial",
      type: String,
    },
    subscriptionId: {
      type: String,
      required: true,
    },
    isInitial: {
      type: Boolean,
    },
    errorMessage: String,
    billingCycle: String,
    upgrade: Boolean,
  },

  {
    timestamps: true,
  }
);

export const Transaction = mongoose.model("Transaction", transactionSchema);
