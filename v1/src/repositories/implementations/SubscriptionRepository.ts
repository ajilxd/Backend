import { ISubscription } from "../../entities/ISubscription";
import { ISubscriptionRepository } from "../interface/ISubscriptionRepository";
import { Subscription } from "../../schemas/subscriptionSchema";
import { BaseRepository } from "./BaseRepository";
import { Model } from "mongoose";

class SubscriptionRepository
  extends BaseRepository<ISubscription<string>>
  implements ISubscriptionRepository
{
  constructor(model: Model<ISubscription<string>>) {
    super(model);
  }
}

export default new SubscriptionRepository(Subscription);
