import { Request, Response, NextFunction } from "express";
import { ISubscriptionController } from "../interface/ISubscriptionController";
import SubscriptionService from "../../services/implementation/SubscriptionService";
import { ISubscriptionService } from "../../services/interface/ISubscriptionService";
import { stripeInstance } from "../..";
import { Features, ISubscription } from "../../entities/ISubscription";
import AppError from "../../errors/appError";
import { sendResponse } from "../../utils/sendResponse";
import { catchAsync } from "../../errors/catchAsyc";
import { errorMap, ErrorType } from "../../constants/response.failture";
import { successMap, SuccessType } from "../../constants/response.succesful";

class SubscriptionController implements ISubscriptionController {
  private SubscriptionService: ISubscriptionService;
  constructor(SubscriptionService: ISubscriptionService) {
    this.SubscriptionService = SubscriptionService;
  }
  AddSubscription = catchAsync(
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const {
        allowChat,
        allowMeeting,
        spaceCount,
        managerCount,
        userCount,
        description,
        yearlyAmount,
        monthlyAmount,
        name,
        billingCycleType,
        yearlyDiscountPercentage,
      } = req.body;

      const features: Features = {
        chat: false,
        meeting: false,
        managerCount: 2,
        spaces: 3,
        userCount: 10,
      };
      const subscription: Partial<ISubscription> = { name, description };

      const stripe_product_id = await stripeInstance.products
        .create({
          name,
          metadata: { description },
        })
        .then((data) => data.id)
        .catch((err) => {
          throw new AppError(
            "failed to create stripe price for month billingCycle " + err,
            errorMap[ErrorType.ServerError].code
          );
        });

      subscription.billingCycleType = billingCycleType;

      switch (billingCycleType) {
        case "month":
          subscription.monthlyAmount = monthlyAmount;
          subscription.stripe_monthly_price_id = await stripeInstance.prices
            .create({
              currency: "inr",
              product: stripe_product_id,
              unit_amount: monthlyAmount * 100,
              recurring: {
                interval: "month",
              },
            })
            .then((data) => data.id)
            .catch((err) => {
              throw new AppError(
                "failed to create stripe price for month billingCycle " + err,
                errorMap[ErrorType.ServerError].code
              );
            });
          break;
        case "year":
          subscription.yearlyAmount = yearlyAmount;
          subscription.stripe_yearly_price_id = await stripeInstance.prices
            .create({
              currency: "inr",
              product: stripe_product_id,
              unit_amount: yearlyAmount * 100,
              recurring: {
                interval: "year",
              },
            })
            .then((data) => data.id)
            .catch((err) => {
              throw new AppError(
                "failed to create stripe price for year billingCycle " + err,
                errorMap[ErrorType.ServerError].code
              );
            });
          break;
        case "both":
          subscription.monthlyAmount = monthlyAmount;
          subscription.yearlyAmount = yearlyAmount;
          subscription.yearlyDiscountPercentage = yearlyDiscountPercentage;
          subscription.stripe_yearly_price_id = await stripeInstance.prices
            .create({
              currency: "inr",
              product: stripe_product_id,
              unit_amount: yearlyAmount * 100,
              recurring: {
                interval: "year",
              },
            })
            .then((data) => data.id)
            .catch((err) => {
              throw new AppError(
                "failed to create stripe price for year billingCycle " + err,
                errorMap[ErrorType.ServerError].code
              );
            });
          subscription.stripe_monthly_price_id = await stripeInstance.prices
            .create({
              currency: "inr",
              product: stripe_product_id,
              unit_amount: monthlyAmount * 100,
              recurring: {
                interval: "month",
              },
            })
            .then((data) => data.id)
            .catch((err) => {
              throw new AppError(
                "failed to create stripe price for year billingCycle " + err,
                errorMap[ErrorType.ServerError].code
              );
            });
      }

      features.spaces = spaceCount;
      features.managerCount = managerCount;
      features.userCount = userCount;
      features.chat = allowChat;
      features.meeting = allowMeeting;

      subscription.features = features;
      subscription.stripe_product_id = stripe_product_id;
      subscription.points =
        subscription.monthlyAmount ||
        Math.ceil(subscription.yearlyAmount! && subscription.yearlyAmount / 12);

      await this.SubscriptionService.createSubscription(subscription);

      sendResponse(
        res,
        successMap[SuccessType.Created].code,
        successMap[SuccessType.Created].message
      );
    }
  );

  updateSubscriptionStatus = catchAsync(
    async (req: Request, res: Response, next: NextFunction): Promise<any> => {
      const updated = await this.SubscriptionService.toggleSubscriptionStatus(
        req.params.id
      );

      sendResponse(
        res,
        successMap[SuccessType.Ok].code,
        successMap[SuccessType.Ok].message,
        updated.name
      );
    }
  );

  updateSubscription = catchAsync(
    async (req: Request, res: Response, next: NextFunction): Promise<any> => {
      const updated = await this.SubscriptionService.updateSubscription(
        req.params.id,
        req.body
      );
      return sendResponse(
        res,
        successMap[SuccessType.Ok].code,
        successMap[SuccessType.Ok].message,
        updated.name
      );
    }
  );
}

export default new SubscriptionController(SubscriptionService);
