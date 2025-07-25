import { Model } from "mongoose";
import { ISubscriber } from "../../entities/ISubscriber";
import { ISubscriberRepository } from "../interface/ISubscriberRepository";
import { BaseRepository } from "./BaseRepository";
import { Subscriber } from "../../schemas/subscriberSchema";

class SubscriberRepository
  extends BaseRepository<ISubscriber>
  implements ISubscriberRepository
{
  constructor(model: Model<ISubscriber>) {
    super(model);
  }

  findByCustomerId(customerId: string) {
    return this.model.findOne({ customerId, status: "active" }).exec();
  }

  async deactivateByCustomerId(customerId: string): Promise<ISubscriber[]> {
    await this.model.updateMany({ customerId }, { status: "inactive" }).exec();
    return this.model.find({ customerId }).exec();
  }
}

export default new SubscriberRepository(Subscriber);
