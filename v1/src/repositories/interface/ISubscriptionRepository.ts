import { ObjectId } from "mongoose";
import { ISubscription } from "../../entities/ISubscription";
import { IBaseRepository } from "./IBaserRepository";

export interface ISubscriptionRepository
  extends IBaseRepository<ISubscription<string>> {}
