import { Router } from "express";
import OwnerController from "../controllers/implementation/OwnerController";
import CompanyController from "../controllers/implementation/CompanyController";
import authMiddleware from "../middleware/auth";
export const ownerRouter = Router();

ownerRouter.post(
  "/register",
  authMiddleware(["owner"]),
  OwnerController.registerOwner
);
ownerRouter.post("/login", OwnerController.loginUser);
ownerRouter.get("/logout", OwnerController.logoutUser);
ownerRouter.post("/verify-otp", OwnerController.AuthenticateOtp);
ownerRouter.post("/resend-otp", OwnerController.resendOtphandler);
ownerRouter.post("/google", OwnerController.handleGoogleClick);
ownerRouter.post("/forget-password", OwnerController.forgotPasswordHandler);
ownerRouter.post("/reset-password", OwnerController.resetPasswordHandler);
ownerRouter.post("/managers", OwnerController.addManagerHandler);
ownerRouter.get("/managers/:id", OwnerController.getAllManagersHandler);
ownerRouter.patch("/managers/:id", OwnerController.toggleManagerStatusHandler);
ownerRouter.get("/subscriptions", OwnerController.showSubscriptionsHandler);
ownerRouter.get("/owners/:id", OwnerController.showOwnersHandler);
ownerRouter.get("/subscription/:id", OwnerController.getOwnerSubscription);
ownerRouter.get("/invoices/:id", OwnerController.fetchOwnerInvoices);
ownerRouter.get("/company/:id", CompanyController.getCompanyHandler);
ownerRouter.put("/company", CompanyController.updateCompanyHandler);
ownerRouter.post("/company", CompanyController.registerCompanyHandler);
