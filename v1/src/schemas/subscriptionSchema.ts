import { Schema, model } from "mongoose";
import { ISubscription } from "../entities/ISubscription";

const SubscriptionSchema: Schema<ISubscription<string>> = new Schema(
  {
    billingCycle: { type: String, required: true },
    amount: { type: String, required: true },
    name: { type: String, required: true },
    stripe_product_id: { type: String, required: false },
    stripe_price_id: { type: String, required: false },
    isActive: { type: Boolean, required: true },
    description: { type: String, required: true },
    features: { type: [String], required: true },
  },
  { timestamps: true }
);

export const Subscription = model<ISubscription<string>>(
  "Subscription",
  SubscriptionSchema
);
