import { IPaymentController } from "../interface/IPaymentController";
import { Request, Response, NextFunction } from "express";
import { stripeInstance } from "../..";
import { sendResponse } from "../../utils/sendResponse";
import AppError from "../../errors/appError";
import { catchAsync } from "../../errors/catchAsyc";
import { equal } from "joi";
import { ITransactionService } from "../../services/interface/ITransactionService";
import TransactionService from "../../services/implementation/TransactionService";
import { IOwnerService } from "../../services/interface/IOwnerService";
import OwnerService from "../../services/implementation/OwnerService";

class PaymentController implements IPaymentController {
  constructor(
    private TransactionService: ITransactionService,
    private OwnerService: IOwnerService
  ) {}
  async checkoutSessionHandler(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      console.log("req body at payment controller", req.body);
      const {
        planId,
        stripeCustomerId,
        subscriptionId,
        ownerId,
        billingCycleType,
        amount,
        yearly,
        monthly,
        points,
        upgrade,
      } = req.body;
      console.log(
        "req body at payment",
        billingCycleType,
        amount,
        yearly,
        monthly,
        points,
        upgrade
      );
      if (!points) {
        return sendResponse(res, 400, "points is missing");
      }
      if (!planId) {
        return sendResponse(res, 400, "Plan ID is required");
      }
      if (!stripeCustomerId) {
        return sendResponse(res, 400, "Stripe Customer ID is required");
      }
      if (!subscriptionId) {
        return sendResponse(res, 400, "Subscription ID is required");
      }
      if (!ownerId) {
        return sendResponse(res, 400, "Owner ID is required");
      }

      if (!process.env.CLIENT_URL) {
        return sendResponse(
          res,
          500,
          `Environment variable CLIENT_URL is missing`
        );
      }

      const brandName = "FluentaWork";
      const brandImage =
        "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500";
      const successUrl = `${process.env.CLIENT_URL}/owner/payment?status=success`;
      const cancelUrl = `${process.env.CLIENT_URL}/owner/payment?status=cancel`;

      const session = await stripeInstance.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [{ price: planId, quantity: 1 }],
        customer: stripeCustomerId,
        mode: "subscription",
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: {
          brandName,
          subscriptionId,
          ownerId,
          billingCycleType,
          yearly,
          monthly,
          amount,
          points,
          upgrade,
        },
        subscription_data: {
          metadata: {
            brandName,
            subscriptionId,
            ownerId,
            billingCycleType,
            yearly,
            monthly,
            amount,
            points,
            upgrade,
          },
        },
      });

      if (!session) {
        return sendResponse(res, 500, "Failed to create checkout session");
      }
      return sendResponse(res, 200, "Succesfully created a checkout session ", {
        id: session.id,
      });
    } catch (error: any) {
      console.error("Stripe subscription checkout error:", {
        message: error.message,
        stack: error.stack,
      });
      return sendResponse(
        res,
        500,
        `Stripe subscription checkout error ${error.message}`
      );
    }
  }

  cancelSubscriptionHandler = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { id } = req.params;
      const { ownerId } = req.body;
      if (!ownerId) {
        throw new AppError("Owner Id is required", 400, "warn");
      }
      if (!id) {
        throw new AppError(
          "subscripton id is required for cancellation",
          400,
          "warn"
        );
      }

      const ownerData = await this.OwnerService.fetchOwnerById(ownerId);

      if (
        !ownerData?.subscription ||
        !ownerData?.subscription?.subscription_id
      ) {
        throw new AppError("User doesnt have subscription", 404, "warn");
      }

      await stripeInstance.subscriptions.cancel("" + id);
      await this.TransactionService.create({
        subscriptionId: ownerData?.subscription?.subscription_id,
        subscriptionName: ownerData.subscription.name!,
        customerId: ownerId,
        customerName: ownerData.name,
        expiryDate: ownerData.subscription.expires_at,
        amount: +ownerData.subscription.amount!,
        companyName: ownerData.company.companyName,
        billingCycle: ownerData.subscription.billingCycle!,
        isCancled: true,
        transactionType: "cancel",
        status: "cancel",
      });

      sendResponse(res, 200, "subscripton cancelled  " + id);
    }
  );
}

export default new PaymentController(TransactionService, OwnerService);
