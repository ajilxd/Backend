import { Router } from "express";
import AdminController from "../controllers/implementation/AdminController";
import SubscriptionController from "../controllers/implementation/SubscriptionController";
import { requestValidator } from "../middleware/requestValidator";
import { AdminLoginDto } from "../dtos/admin/admin.dto";
import { CreateSubscriptionDto } from "../dtos/subscription/subscription.dto";

export const adminRouter = Router();

adminRouter.post(
  "/login",
  requestValidator(AdminLoginDto),
  AdminController.loginAdmin
);
adminRouter.post(
  "/subscription",
  requestValidator(CreateSubscriptionDto),
  SubscriptionController.AddSubscription
);
adminRouter.get("/subscriptions", SubscriptionController.getSubscriptions);

adminRouter.patch(
  "/toggle-subscription-status/:id",
  SubscriptionController.updateSubscriptionStatus
);

adminRouter.get("/owners", AdminController.showOwners);
adminRouter.patch(
  "/toggle-owner-status/:id",
  AdminController.toggleOwnerStatus
);

adminRouter.get("/logout", AdminController.logoutAdmin);
