import { ISubscriber } from "../../entities/ISubscriber";
import { IBaseRepository } from "./IBaserRepository";

export interface ISubscriberRepository extends IBaseRepository<ISubscriber> {
  findByCustomerId(customerId: string): Promise<ISubscriber | null>;
}
