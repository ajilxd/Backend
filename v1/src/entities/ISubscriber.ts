import { ObjectId, Document } from "mongoose";

export interface ISubscriber extends Document {
  _id: ObjectId;
  name: string;
  status: string;
  billingCycle: string;
  cancelledAt: string;
  expiresAt: Date;
  subscriptionId: string;
  amount: number;
  customerName: string;
  customerId: string;
  createdAt: string;
  features: {
    managerCount: number;
    userCount: number;
    chat: boolean;
    meeting: boolean;
    spaces: number;
  };
  points: number;
  company: string;
  stripe_subscription_id: string;
}
