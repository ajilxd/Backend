export interface ISubscriptionService<T> {
  createSubcription(subascriptionData: T): Promise<T>;
  fetchSubscriptions(): Promise<T[]>;
  updateSubscription(
    subscriptionId: string,
    subscriptionData: Partial<T>
  ): Promise<T>;
  findSubscriptionById(id: string): Promise<T>;
}
