import { Router } from "express";

import PaymentController from "../controllers/implementation/PaymentController";

export const paymentRouter = Router();

paymentRouter.post(
  "/create-checkout-session",
  PaymentController.checkoutSessionHandler
);

paymentRouter.delete(
  "/cancel-subscription/:id",
  PaymentController.cancelSubscriptionHandler
);
