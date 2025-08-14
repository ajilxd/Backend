import { Router } from "express";
import AdminController from "../controllers/implementation/AdminController";
import SubscriptionController from "../controllers/implementation/SubscriptionController";
import { validateBody } from "../middleware/requestValidator";
import { AdminLoginDto } from "../dtos/admin/AdminLogin.dto";
import { validateQuery } from "../middleware/requestQueryValidator";
import { FetchUserQueryDTO } from "../dtos/admin/FetchUsersquery.dto";
import { BlockUserDTO } from "../dtos/admin/BlockUserDto";
import authMiddleware from "../middleware/auth";
import { FetchTransactionQueryDTO } from "../dtos/admin/FetchTransactionquery.dto";
import { FetchAllSubscribersQueryDTO } from "../dtos/admin/FetchAllSubscribersquery.dto";
import { FetchAllSubscriptionsqueryDto } from "../dtos/admin/FetchAllSubscriptionsquery.dto";
import { AddSubscription } from "../dtos/subscription/AddSubscription.dto";
import { UpdateSubscription } from "../dtos/subscription/UpdateSubscription.dto";

export const adminRouter = Router();

adminRouter.post(
  "/login",
  validateBody(AdminLoginDto),
  AdminController.loginAdmin
);
adminRouter.post(
  "/subscription",
  authMiddleware(["admin"]),
  validateBody(AddSubscription),
  SubscriptionController.AddSubscription
);

adminRouter.get(
  "/subscriptions",
  authMiddleware(["admin"]),
  validateQuery(FetchAllSubscriptionsqueryDto),
  AdminController.fetchAllSubscriptions
);

adminRouter.put(
  "/subscription/:id",
  authMiddleware(["admin"]),
  validateBody(UpdateSubscription),
  SubscriptionController.updateSubscription
);

adminRouter.patch(
  "/toggle-subscription-status/:id",
  authMiddleware(["admin"]),
  SubscriptionController.updateSubscriptionStatus
);

adminRouter.get(
  "/logout",
  authMiddleware(["admin"]),
  AdminController.logoutAdmin
);

adminRouter.get(
  "/users",
  authMiddleware(["admin"]),
  validateQuery(FetchUserQueryDTO),
  AdminController.fetchAllusersHandler
);

adminRouter.patch(
  "/users",
  authMiddleware(["admin"]),
  validateBody(BlockUserDTO),
  AdminController.BlockUser
);

adminRouter.get(
  "/transactions",
  authMiddleware(["admin"]),
  validateQuery(FetchTransactionQueryDTO),
  AdminController.fetchAllTransactions
);

adminRouter.get(
  "/subscribers",
  authMiddleware(["admin"]),
  validateQuery(FetchAllSubscribersQueryDTO),
  AdminController.fetchAllSubscribers
);

adminRouter.get(
  "/sales-report",
  authMiddleware(["admin"]),
  AdminController.fetchSalesReport
);

adminRouter.get(
  "/dashboard",
  authMiddleware(["admin"]),
  AdminController.fetchDashboard
);
