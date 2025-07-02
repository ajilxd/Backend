import { Router } from "express";
import OwnerController from "../controllers/implementation/OwnerController";
import CompanyController from "../controllers/implementation/CompanyController";
import authMiddleware from "../middleware/auth";
export const ownerRouter = Router();

ownerRouter.post(
  "/register",

  OwnerController.registerOwner
);
ownerRouter.post("/login", OwnerController.loginUser);
ownerRouter.get("/logout", OwnerController.logoutUser);
ownerRouter.post("/verify-otp", OwnerController.AuthenticateOtp);
ownerRouter.post("/request-otp", OwnerController.requestOtpHandler);
ownerRouter.post("/resend-otp", OwnerController.resendOtphandler);
ownerRouter.post("/google", OwnerController.handleGoogleClick);
ownerRouter.post("/forget-password", OwnerController.forgotPasswordHandler);
ownerRouter.post("/reset-password", OwnerController.resetPasswordHandler);

ownerRouter.get(
  "/",
  authMiddleware(["owner"]),
  OwnerController.getOwnersByFieldHandler
);

ownerRouter.put(
  "/profile",
  authMiddleware(["owner"]),
  OwnerController.updateProfile
);
ownerRouter.post(
  "/managers",
  authMiddleware(["owner"]),
  OwnerController.addManagerHandler
);
ownerRouter.get(
  "/managers/:id",
  authMiddleware(["owner"]),
  OwnerController.getAllManagersHandler
);
ownerRouter.patch(
  "/managers/:id",
  authMiddleware(["owner"]),
  OwnerController.toggleManagerStatusHandler
);

ownerRouter.put(
  "/manager",
  authMiddleware(["owner"]),
  OwnerController.editManagerHandler
);
ownerRouter.get(
  "/subscriptions",
  authMiddleware(["owner"]),
  OwnerController.showSubscriptionsHandler
);
ownerRouter.get(
  "/owners/:id",
  authMiddleware(["owner"]),
  OwnerController.showOwnersHandler
);
ownerRouter.get(
  "/subscription/:id",
  authMiddleware(["owner"]),
  OwnerController.getOwnerSubscription
);
ownerRouter.get(
  "/invoices/:id",
  authMiddleware(["owner"]),
  OwnerController.fetchOwnerInvoices
);
ownerRouter.get(
  "/company/:id",
  authMiddleware(["owner"]),
  CompanyController.getCompanyHandler
);
ownerRouter.put(
  "/company",
  authMiddleware(["owner"]),
  CompanyController.updateCompanyHandler
);
ownerRouter.post(
  "/company",
  authMiddleware(["owner"]),
  CompanyController.registerCompanyHandler
);
