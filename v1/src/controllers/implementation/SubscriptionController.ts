import { Request, Response, NextFunction } from "express";
import { ISubscriptionController } from "../interface/ISubscriptionController";
import SubscriptionService from "../../services/implementation/SubscriptionService";
import { ISubscriptionService } from "../../services/interface/ISubscriptionService";
import { stripeInstance } from "../..";
import { ISubscription } from "../../entities/ISubscription";
import AppError from "../../errors/appError";
import { sendResponse } from "../../utils/sendResponse";
import { catchAsync } from "../../errors/catchAsyc";

class SubscriptionController implements ISubscriptionController {
  private SubscriptionService: ISubscriptionService<ISubscription<string>>;
  constructor(
    SubscriptionService: ISubscriptionService<ISubscription<string>>
  ) {
    this.SubscriptionService = SubscriptionService;
  }
  AddSubscription = catchAsync(
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const { name, billingCycle, amount, description, features } = req.body;

      const subscription = await this.SubscriptionService.createSubcription({
        ...req.body,
        amount,
      });

      const product = await stripeInstance.products.create({
        name,
        metadata: { description },
      });

      const price = await stripeInstance.prices.create({
        currency: "usd",
        product: product.id,
        unit_amount: amount * 100,
        recurring: {
          interval: billingCycle,
        },
      });

      const updated = await this.SubscriptionService.updateSubscription(
        `` + subscription._id,
        {
          ...subscription.toObject(),
          stripe_price_id: "" + price.id,
          stripe_product_id: "" + product.id,
        }
      );

      if (!updated) {
        throw new AppError(
          "updating stripe datas to subscription failed",
          500,
          "error"
        );
      }
      sendResponse(
        res,
        201,
        `subscription with ${name} created succesfully`,
        updated
      );
    }
  );

  getSubscriptions = catchAsync(
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const data = await this.SubscriptionService.fetchSubscriptions();
      if (data.length > 0) {
        return sendResponse(res, 201, "subscription fetched successfuly", data);
      } else {
        return sendResponse(res, 204, "No data ");
      }
    }
  );

  updateSubscriptionStatus = catchAsync(
    async (req: Request, res: Response, next: NextFunction): Promise<any> => {
      const existingSubscription =
        await this.SubscriptionService.findSubscriptionById(req.params.id);
      const updated = await this.SubscriptionService.updateSubscription(
        req.params.id,
        { isActive: !existingSubscription.isActive }
      );
      if (!updated) {
        throw new AppError("error updating subscription status", 500, "error");
      }
      return sendResponse(
        res,
        200,
        `updation on subscription went succesful for ${req.params.id}`
      );
    }
  );
}

export default new SubscriptionController(SubscriptionService);
