import { ISubscriber } from "../../entities/ISubscriber";

export interface ISubscriberService {
  createSubscriber(data: Partial<ISubscriber>): Promise<ISubscriber>;
  fetchAll(): Promise<ISubscriber[]>;
  deactivateSubscriber(customerId: string): Promise<ISubscriber[]>;
  findByCustomerId(id: string): Promise<ISubscriber | null>;
}
