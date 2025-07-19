import { ISubscription } from "../../entities/ISubscription";

export interface ISubscriptionService {
  createSubscription(
    subascriptionData: Partial<ISubscription>
  ): Promise<ISubscription>;
  fetchSubscriptions(): Promise<ISubscription[]>;
  updateSubscription(
    subscriptionId: string,
    subscriptionData: Partial<ISubscription>
  ): Promise<ISubscription>;
  findSubscriptionById(id: string): Promise<ISubscription>;
}
