import { ObjectId, Document } from "mongoose";

export type Features = {
  managerCount: number;
  userCount: number;
  chat: boolean;
  meeting: boolean;
  spaces: number;
};

export interface ISubscription extends Document {
  _id: ObjectId;
  name: string;
  billingCycleType: string;
  isActive: boolean;
  yearlyAmount: number;
  monthlyAmount: number;
  stripe_product_id?: string;
  description: string;
  stripe_monthly_price_id?: string;
  stripe_yearly_price_id?: string;
  yearlyDiscountPercentage?: number;
  features: Features;
}
