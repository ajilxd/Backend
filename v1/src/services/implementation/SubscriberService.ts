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

  async update(
    customerId: string,
    data: Partial<ISubscriber>
  ): Promise<ISubscriber | null> {
    const subscriber = await this.SubscriberRepository.findByCustomerId(
      customerId
    );
    if (subscriber) {
      return this.SubscriberRepository.update("" + subscriber._id, data);
    }
    return null;
  }
}

export default new SubscriberService(SubscriberRepository);
