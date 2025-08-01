import { Router } from "express";
import AdminController from "../controllers/implementation/AdminController";
import SubscriptionController from "../controllers/implementation/SubscriptionController";
import { requestValidator } from "../middleware/requestValidator";
import { AdminLoginDto } from "../dtos/admin/admin.dto";
import { validateQueryDTO } from "../middleware/requestQueryValidator";
import { FetchUserQueryDTO } from "../dtos/admin/fetchUsersquery.dto";

export const adminRouter = Router();

adminRouter.post(
  "/login",
  requestValidator(AdminLoginDto),
  AdminController.loginAdmin
);
adminRouter.post("/subscription", SubscriptionController.AddSubscription);

adminRouter.get("/subscriptions", AdminController.fetchAllSubscriptions);

adminRouter.put("/subscription/:id", SubscriptionController.updateSubscription);

adminRouter.patch(
  "/toggle-subscription-status/:id",
  SubscriptionController.updateSubscriptionStatus
);

adminRouter.get("/logout", AdminController.logoutAdmin);

adminRouter.get(
  "/users",
  validateQueryDTO(FetchUserQueryDTO),
  AdminController.fetchAllusersHandler
);

adminRouter.patch("/users", AdminController.BlockUser);

adminRouter.get("/transactions", AdminController.fetchAllTransactions);

adminRouter.get("/subscribers", AdminController.fetchAllSubscribers);

adminRouter.get("/sales-report", AdminController.fetchSalesReport);

adminRouter.get("/dashboard", AdminController.fetchDashboard);
