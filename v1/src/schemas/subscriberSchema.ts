import mongoose, { model, Schema } from "mongoose";
import { ISubscriber } from "../entities/ISubscriber";

const subscriberSchema: Schema<ISubscriber> = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    subscriptionId: {
      type: String,
      required: true,
    },
    billingCycle: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    features: {
      managerCount: {
        type: Number,
        default: 2,
      },
      userCount: {
        type: Number,
        default: 20,
      },
      chat: {
        type: Boolean,
        default: false,
      },
      meeting: {
        type: Boolean,
        default: false,
      },
      spaces: {
        type: Number,
        default: 0,
      },
    },
    expiresAt: {
      type: Date,
    },
    customerName: String,
    customerId: String,
    points: Number,
    status: String,
    company: String,
  },
  {
    timestamps: true,
  }
);

export const Subscriber = model("subscriber", subscriberSchema);
