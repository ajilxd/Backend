import { ISubscriptionRepository } from "../../repositories/interface/ISubscriptionRepository";
import { ISubscription } from "../../entities/ISubscription";
import AppError from "../../errors/appError";
import { ISubscriptionService } from "../interface/ISubscriptionService";
import subscriptionRepository from "../../repositories/implementations/SubscriptionRepository";

import { errorMap, ErrorType } from "../../constants/response.failture";

import { successMap, SuccessType } from "../../constants/response.succesful";

class SubscriptionService
  implements ISubscriptionService<ISubscription<string>>
{
  private subscriptionRepository: ISubscriptionRepository;
  constructor(subscriptionRepository: ISubscriptionRepository) {
    this.subscriptionRepository = subscriptionRepository;
  }

  async createSubcription(
    data: ISubscription<string>
  ): Promise<ISubscription<string>> {
    const existingSubscription = await this.subscriptionRepository.findOne({
      name: data.name,
    });

    if (existingSubscription) {
      throw new AppError(
        errorMap[ErrorType.conflict].message,
        errorMap[ErrorType.conflict].code
      );
    }

    const result = await this.subscriptionRepository.create(data);

    return result;
  }

  async fetchSubscriptions(): Promise<ISubscription<string>[]> {
    const result = await this.subscriptionRepository.findAll();
    if (result.length > 0) {
      return result;
    } else {
      throw new AppError(
        successMap[SuccessType.NoContent].message,
        successMap[SuccessType.Accepted].code
      );
    }
  }

  async updateSubscription(
    id: string,
    data: ISubscription<string>
  ): Promise<ISubscription<string>> {
    const existingSubscription = await this.subscriptionRepository.findOne({
      _id: id,
    });
    if (!existingSubscription) {
      throw new AppError(
        errorMap[ErrorType.NotFound].message,
        errorMap[ErrorType.NotFound].code
      );
    }
    const result = await this.subscriptionRepository.update(id, data);
    if (result) {
      return result;
    } else {
      throw new AppError(
        "error updating subscription status",
        errorMap[ErrorType.ServerError].code
      );
    }
  }

  async findSubscriptionById(id: string): Promise<ISubscription<string>> {
    console.log("hey iam subscription service", id);
    if (!id) {
      throw new AppError("Id required for fetching subscription", 400);
    }
    const result = await this.subscriptionRepository.findOne({ _id: id });
    if (result) {
      return result;
    } else {
      throw new AppError(
        "No subscripiton found for this " + id,
        errorMap[ErrorType.NotFound].code
      );
    }
  }
}

export default new SubscriptionService(subscriptionRepository);
