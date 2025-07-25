import { ISubscriber } from "../../entities/ISubscriber";
import SubscriberRepository from "../../repositories/implementations/SubscriberRepository";
import { ISubscriberRepository } from "../../repositories/interface/ISubscriberRepository";
import { ISubscriberService } from "../interface/ISubscriberService";

class SubscriberService implements ISubscriberService {
  constructor(private SubscriberRepository: ISubscriberRepository) {}
  createSubscriber(data: Partial<ISubscriber>): Promise<ISubscriber> {
    return this.SubscriberRepository.create(data);
  }

  fetchAll(): Promise<ISubscriber[]> {
    return this.SubscriberRepository.findAll();
  }

  findByCustomerId(id: string): Promise<ISubscriber | null> {
    return this.SubscriberRepository.findByCustomerId(id);
  }

  deactivateSubscriber(customerId: string): Promise<ISubscriber[]> {
    return this.SubscriberRepository.deactivateByCustomerId(customerId);
  }
}

export default new SubscriberService(SubscriberRepository);
