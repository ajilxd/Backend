import { Router } from "express";
import AdminController from "../controllers/implementation/AdminController";
import SubscriptionController from "../controllers/implementation/SubscriptionController";
import { validateBody } from "../middleware/requestValidator";
import { AdminLoginDto } from "../dtos/admin/admin.dto";
import { validateQuery } from "../middleware/requestQueryValidator";
import { FetchUserQueryDTO } from "../dtos/admin/fetchUsersquery.dto";
import { PatchUserDTO } from "../dtos/admin/patchUserDto";
import authMiddleware from "../middleware/auth";
import { FetchTransactionQueryDTO } from "../dtos/admin/fetchTransactionquery.dto";

export const adminRouter = Router();

adminRouter.post(
  "/login",
  validateBody(AdminLoginDto),
  AdminController.loginAdmin
);
adminRouter.post(
  "/subscription",
  authMiddleware(["admin"]),
  SubscriptionController.AddSubscription
);

adminRouter.get(
  "/subscriptions",
  authMiddleware(["admin"]),
  AdminController.fetchAllSubscriptions
);

adminRouter.put(
  "/subscription/:id",
  authMiddleware(["admin"]),
  SubscriptionController.updateSubscription
);

adminRouter.patch(
  "/toggle-subscription-status/:id",
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
  validateBody(PatchUserDTO),
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
