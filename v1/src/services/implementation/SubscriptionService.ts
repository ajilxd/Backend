import { ISubscriptionRepository } from "../../repositories/interface/ISubscriptionRepository";
import { ISubscription } from "../../entities/ISubscription";
import AppError from "../../errors/appError";
import { ISubscriptionService } from "../interface/ISubscriptionService";
import subscriptionRepository from "../../repositories/implementations/SubscriptionRepository";

class SubscriptionService implements ISubscriptionService {
  private subscriptionRepository: ISubscriptionRepository;
  constructor(subscriptionRepository: ISubscriptionRepository) {
    this.subscriptionRepository = subscriptionRepository;
  }

  async createSubscription(data: ISubscription): Promise<ISubscription> {
    const existingSubscription = await this.subscriptionRepository.findOne({
      name: data.name,
    });

    if (existingSubscription) {
      throw new AppError("existing subscription name", 409, "warn");
    }

    const result = await this.subscriptionRepository.create(data);

    return result;
  }

  async fetchSubscriptions(): Promise<ISubscription[]> {
    const result = await this.subscriptionRepository.findAll();

    return result;
  }

  async updateSubscription(
    id: string,
    data: ISubscription
  ): Promise<ISubscription> {
    const existingSubscription = await this.subscriptionRepository.findOne({
      _id: id,
    });
    if (!existingSubscription) {
      throw new AppError("No subscription found with this id", 404, "warn");
    }
    const result = await this.subscriptionRepository.update(id, data);
    if (result) {
      return result;
    } else {
      throw new AppError("error updating subscription", 500, "error");
    }
  }

  async findSubscriptionById(id: string): Promise<ISubscription> {
    if (!id) {
      throw new AppError("Id required for fetching subscription", 400, "warn");
    }
    const result = await this.subscriptionRepository.findOne({ _id: id });
    if (result) {
      return result;
    } else {
      throw new AppError("No subscripiton found for this " + id, 404, "warn");
    }
  }
}

export default new SubscriptionService(subscriptionRepository);
