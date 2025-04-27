import { Router } from "express";
import AdminController from "../controllers/implementation/AdminController";
import SubscriptionController from "../controllers/implementation/SubscriptionController";

export const adminRouter = Router();

adminRouter.post(
  "/login",

  AdminController.loginAdmin
);
adminRouter.get("/logout", AdminController.logoutAdmin);
adminRouter.post("/subscription", SubscriptionController.AddSubscription);
adminRouter.get("/subscriptions", SubscriptionController.getSubscriptions);

adminRouter.patch(
  "/update-subscription-status/:id",
  SubscriptionController.updateSubscriptionStatus
);

adminRouter.get("/owners", AdminController.showOwners);
adminRouter.patch(
  "/toggle-owner-status/:id",
  AdminController.toggleOwnerStatus
);
