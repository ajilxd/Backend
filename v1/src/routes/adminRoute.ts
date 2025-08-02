import { Router } from "express";
import AdminController from "../controllers/implementation/AdminController";
import SubscriptionController from "../controllers/implementation/SubscriptionController";
import { validateBody } from "../middleware/requestValidator";
import { AdminLoginDto } from "../dtos/admin/admin.dto";
import { validateQuery } from "../middleware/requestQueryValidator";
import { FetchUserQueryDTO } from "../dtos/admin/fetchUsersquery.dto";
import { PatchUserDTO } from "../dtos/admin/patchUserDto";
import authMiddleware from "../middleware/auth";

export const adminRouter = Router();

adminRouter.post(
  "/login",
  validateBody(AdminLoginDto),
  AdminController.loginAdmin
);
adminRouter.post("/subscription", SubscriptionController.AddSubscription);

adminRouter.get("/subscriptions", AdminController.fetchAllSubscriptions);

adminRouter.put("/subscription/:id", SubscriptionController.updateSubscription);

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
  validateQuery(FetchUserQueryDTO),
  AdminController.fetchAllusersHandler
);

adminRouter.patch(
  "/users",
  validateBody(PatchUserDTO),
  AdminController.BlockUser
);

adminRouter.get("/transactions", AdminController.fetchAllTransactions);

adminRouter.get("/subscribers", AdminController.fetchAllSubscribers);

adminRouter.get("/sales-report", AdminController.fetchSalesReport);

adminRouter.get("/dashboard", AdminController.fetchDashboard);
