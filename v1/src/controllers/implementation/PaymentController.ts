import { IPaymentController } from "../interface/IPaymentController";
import { Request, Response, NextFunction } from "express";
import { stripeInstance } from "../..";
import { sendResponse } from "../../utils/sendResponse";
import { errorMap, ErrorType } from "../../constants/response.failture";
import { successMap, SuccessType } from "../../constants/response.succesful";
import { logger } from "../../utils/logger";
import AppError from "../../errors/appError";
import { catchAsync } from "../../errors/catchAsyc";

class PaymentController implements IPaymentController {
  async checkoutSessionHandler(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { planId, stripeCustomerId, subscriptionId, ownerId } = req.body;
      console.log(req.body);

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
        logger.error("Environment variable CLIENT_URL is missing.");
        return sendResponse(
          res,
          errorMap[ErrorType.ServerError].code,
          errorMap[ErrorType.ServerError].message
        );
      }

      const brandName = "FluentaWork";
      const brandImage =
        "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500";
      const successUrl = `${process.env.CLIENT_URL}/owner/payment?status=success`;
      const cancelUrl = `${process.env.CLIENT_URL}/owner/payment?status=cancel`;

      // Create the subscription checkout session
      const session = await stripeInstance.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price: planId, // Use the pre-configured price ID from Stripe
            quantity: 1,
          },
        ],
        customer: stripeCustomerId,

        mode: "subscription",
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: {
          brandName,
          subscriptionId,
          ownerId,
        },
      });

      if (!session) {
        return sendResponse(
          res,
          errorMap[ErrorType.ServerError].code,
          "Failed to create checkout session"
        );
      }
      return sendResponse(
        res,
        successMap[SuccessType.Ok].code,
        successMap[SuccessType.Ok].message,
        { id: session.id }
      );
    } catch (error: any) {
      logger.error("Stripe subscription checkout error:", {
        message: error.message,
        stack: error.stack,
      });
      return sendResponse(
        res,
        errorMap[ErrorType.ServerError].code,
        errorMap[ErrorType.ServerError].message
      );
    }
  }

  cancelSubscriptionHandler = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { id } = req.params;
      if (!id) {
        throw new AppError("subscripton id is required for cancellation", 500);
      }

      await stripeInstance.subscriptions.cancel("" + id);
      logger.info("subscription cancelled for ", id);
      sendResponse(res, 200, "subscripton cancelled  " + id);
    }
  );
}

export default new PaymentController();
