import { ObjectId, Document } from "mongoose";

export interface IOwner extends Document {
  _id: ObjectId;
  name: string;
  email: string;
  password: string;
  subscriptionId?: ObjectId;
  isVerified: boolean;
  isBlocked: boolean;
  owner?: string;
  stripe_customer_id?: string;
  refreshToken?: string;

  subscription?: {
    name?: string;
    isActive?: boolean;
    billingCycle?: string;
    stripe_subscription_id?: string;
    subscription_id?: string;
    next_invoice?: Date;
    cancel_at?: Date;
    canceled_at?: Date;
    created?: Date;
    features?: Array<string>;
    amount?: string;
    expires_at?: Date;
    invoice?: string;
  };

  invoices?: [];

  comparePassword(enteredPassword: string): Promise<boolean>;
}
