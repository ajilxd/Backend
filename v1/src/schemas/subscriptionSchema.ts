import mongoose from "mongoose";
import { ISubscription } from "../entities/ISubscription";

const subscriptionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    description: {
      type: String,
    },

    billingCycleType: {
      type: String,
      enum: ["month", "year", "both"],
      required: true,
    },

    monthlyAmount: Number,
    yearlyAmount: Number,

    yearlyDiscountPercentage: Number,

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

    isActive: {
      type: Boolean,
      default: true,
    },

    stripe_product_id: {
      type: String,
    },

    stripe_monthly_price_id: {
      type: String,
    },

    stripe_yearly_price_id: {
      type: String,
    },
    points: {
      type: Number,
    },
  },
  { timestamps: true }
);

export const Subscription = mongoose.model<ISubscription>(
  "Subscription",
  subscriptionSchema
);
