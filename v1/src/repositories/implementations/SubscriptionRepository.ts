import { ISubscription } from "../../entities/ISubscription";
import { ISubscriptionRepository } from "../interface/ISubscriptionRepository";
import { Subscription } from "../../schemas/subscriptionSchema";
import { BaseRepository } from "./BaseRepository";
import { Model } from "mongoose";

class SubscriptionRepository
  extends BaseRepository<ISubscription>
  implements ISubscriptionRepository
{
  constructor(model: Model<ISubscription>) {
    super(model);
  }
}

export default new SubscriptionRepository(Subscription);
