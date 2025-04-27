import { Request, Response, NextFunction } from "express";
import { ISubscriptionController } from "../interface/ISubscriptionController";
import SubscriptionService from "../../services/implementation/SubscriptionService";
import { ISubscriptionService } from "../../services/interface/ISubscriptionService";
import { stripeInstance } from "../..";
import { ISubscription } from "../../entities/ISubscription";
import AppError from "../../errors/appError";
import { errorMap, ErrorType } from "../../constants/response.failture";
import { sendResponse } from "../../utils/sendResponse";
import { successMap, SuccessType } from "../../constants/response.succesful";
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
      console.log(req.body);
      // creating subscription
      const subscription = await this.SubscriptionService.createSubcription({
        ...req.body,
        amount,
      });
      //creating  product in stripe
      const product = await stripeInstance.products.create({
        name,
        metadata: { description },
      });

      // creating price in stripe
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
          errorMap[ErrorType.ServerError].message,
          errorMap[ErrorType.ServerError].code
        );
      }
      sendResponse(
        res,
        successMap[SuccessType.Created].code,
        successMap[SuccessType.Created].message,
        updated
      );
    }
  );

  getSubscriptions = catchAsync(
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const data = await this.SubscriptionService.fetchSubscriptions();
      if (data.length > 0) {
        return sendResponse(
          res,
          successMap[SuccessType.Accepted].code,
          "successful",
          data
        );
      } else {
        return sendResponse(
          res,
          successMap[SuccessType.NoContent].code,
          "No data "
        );
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
        throw new AppError("error updating subscription status", 500);
      }
      return sendResponse(
        res,
        successMap[SuccessType.Ok].code,
        successMap[SuccessType.Ok].message
      );
    }
  );
}

export default new SubscriptionController(SubscriptionService);
