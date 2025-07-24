import { ISubscriber } from "../../entities/ISubscriber";

export interface ISubscriberService {
  createSubscriber(data: Partial<ISubscriber>): Promise<ISubscriber>;
  fetchAll(): Promise<ISubscriber[]>;
  update(
    customerId: string,
    data: Partial<ISubscriber>
  ): Promise<ISubscriber | null>;
  findByCustomerId(id: string): Promise<ISubscriber | null>;
}
