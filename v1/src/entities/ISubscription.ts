import { ObjectId, Document } from "mongoose";

export interface ISubscription<T> extends Document {
  _id: ObjectId;
  billingCycle: T;
  amount: T;
  name: T;
  stripe_product_id?: T;
  stripe_price_id?: T;
  isActive: boolean;
  description: T;
  features: Array<T>;
}
