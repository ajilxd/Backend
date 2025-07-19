import { Request, Response, NextFunction } from "express";
import { ISubscriptionController } from "../interface/ISubscriptionController";
import SubscriptionService from "../../services/implementation/SubscriptionService";
import { ISubscriptionService } from "../../services/interface/ISubscriptionService";
import { stripeInstance } from "../..";
import { Features, ISubscription } from "../../entities/ISubscription";
import AppError from "../../errors/appError";
import { sendResponse } from "../../utils/sendResponse";
import { catchAsync } from "../../errors/catchAsyc";

class SubscriptionController implements ISubscriptionController {
  private SubscriptionService: ISubscriptionService;
  constructor(SubscriptionService: ISubscriptionService) {
    this.SubscriptionService = SubscriptionService;
  }
  AddSubscription = catchAsync(
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const chatAllowed = !!req.body.allowChatWithSpace;
      const meetingAllowed = !!req.body.allowMeetingWithSpace;
      const yearlyDiscountPercentage = +req.body.yearlyDiscountPercentage;
      const spaceCount = +req.body.numberOfSpaces;
      const managerCount = +req.body.numberOfManagers;
      const userCount = +req.body.numberOfUsers;
      const description = req.body.description;
      const yearlyAmount = +req.body.yearlyAmount;
      const monthlyAmount = +req.body.monthlyAmount;
      const billingCycleType = req.body.billingCycleType;
      const name = req.body.name;

      const features: Features = {
        chat: false,
        meeting: false,
        managerCount: 2,
        spaces: 3,
        userCount: 10,
      };
      const subscription: Partial<ISubscription> = { name, description };

      const existingSubscriptionName = await (
        await this.SubscriptionService.fetchSubscriptions()
      ).find((i) => i.name === name);

      if (existingSubscriptionName) {
        throw new AppError("Duplicate subscription name", 409, "warn");
      }

      const stripe_product_id = await stripeInstance.products
        .create({
          name,
          metadata: { description },
        })
        .then((data) => data.id)
        .catch((err) => {
          throw new AppError(
            "failed to create stripe price for month billingCycle " + err,
            500
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
                500
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
                500
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
                500
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
                500
              );
            });
      }

      if (spaceCount) {
        features.spaces = +spaceCount;
      }

      if (managerCount) {
        features.managerCount = managerCount;
      }

      if (userCount) {
        features.userCount = userCount;
      }

      if (chatAllowed) {
        features.chat = chatAllowed;
      }

      if (meetingAllowed) {
        features.meeting = meetingAllowed;
      }

      subscription.features = features;
      subscription.stripe_product_id = stripe_product_id;

      const result = await this.SubscriptionService.createSubscription(
        subscription
      );

      sendResponse(
        res,
        201,
        `subscription with ${name} created succesfully`,
        result
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
        `updation on subscription went succesful for ${req.params.id}`,
        updated
      );
    }
  );
}

export default new SubscriptionController(SubscriptionService);
