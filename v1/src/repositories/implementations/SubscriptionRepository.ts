import { ISubscription } from "../../entities/ISubscription";
import { ISubscriptionRepository } from "../interface/ISubscriptionRepository";
import { Subscription } from "../../schemas/subscriptionSchema";
import { BaseRepository } from "./BaseRepository";

class SubscriptionRepository
  extends BaseRepository<ISubscription<string>>
  implements ISubscriptionRepository
{
  constructor() {
    super(Subscription);
  }
}

export default new SubscriptionRepository();
