import { ISubscriptionRepository } from "../../repositories/interface/ISubscriptionRepository";
import { ISubscription } from "../../entities/ISubscription";
import AppError from "../../errors/appError";
import { ISubscriptionService } from "../interface/ISubscriptionService";
import subscriptionRepository from "../../repositories/implementations/SubscriptionRepository";
import { errorMap, ErrorType } from "../../constants/response.failture";

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
      throw new AppError(
        errorMap[ErrorType.conflict].message,
        errorMap[ErrorType.conflict].code,
        "warn"
      );
    }

    return await this.subscriptionRepository.create(data);
  }

  async fetchSubscriptions(): Promise<ISubscription[]> {
    return await this.subscriptionRepository.findAll();
  }

  async updateSubscription(
    id: string,
    data: Partial<ISubscription>
  ): Promise<ISubscription> {
    const existingSubscription = await this.subscriptionRepository.findOne({
      _id: id,
    });
    if (!existingSubscription) {
      throw new AppError(
        "No subscription found with this id",
        errorMap[ErrorType.NotFound].code,
        "warn"
      );
    }
    const result = await this.subscriptionRepository.update(id, data);
    if (result) {
      return result;
    } else {
      throw new AppError(
        errorMap[ErrorType.ServerError].message,
        errorMap[ErrorType.ServerError].code,
        "error"
      );
    }
  }

  async toggleSubscriptionStatus(id: string): Promise<ISubscription> {
    const existingSubscription = await this.findSubscriptionById(id);
    const updated = await this.updateSubscription(id, {
      isActive: !existingSubscription.isActive,
    });
    return updated;
  }

  async findSubscriptionById(_id: string): Promise<ISubscription> {
    const result = await this.subscriptionRepository.findOne({ _id });
    if (result) {
      return result;
    } else {
      throw new AppError(
        errorMap[ErrorType.NotFound].message,
        errorMap[ErrorType.NotFound].code,
        "warn"
      );
    }
  }
}

export default new SubscriptionService(subscriptionRepository);
