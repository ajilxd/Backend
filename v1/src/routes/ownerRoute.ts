import { Router } from "express";
import OwnerController from "../controllers/implementation/OwnerController";
import CompanyController from "../controllers/implementation/CompanyController";
import authMiddleware from "../middleware/auth";
import { validateBody } from "../middleware/requestValidator";
import { OwnerLoginDto } from "../dtos/owner/OwnerLogin.dto";
import { OwnerOtpVerfication } from "../dtos/owner/OwnerOtpVerification.dto";
import { ownerSendOtp } from "../dtos/owner/OwnerSendOtp.dto";
import { OwnerGoogleLogin } from "../dtos/owner/OwnerGoogleLogin.dto";
import { OwnerRegister } from "../dtos/owner/OwnerRegister.dto";
export const ownerRouter = Router();

ownerRouter.post(
  "/register",
  validateBody(OwnerRegister),
  OwnerController.registerOwner
);
ownerRouter.post(
  "/login",
  validateBody(OwnerLoginDto),
  OwnerController.loginUser
);
ownerRouter.get("/logout", OwnerController.logoutUser);
ownerRouter.post(
  "/verify-otp",
  validateBody(OwnerOtpVerfication),
  OwnerController.AuthenticateOtp
);
ownerRouter.post(
  "/request-otp",
  validateBody(ownerSendOtp),
  OwnerController.requestOtpHandler
);
ownerRouter.post(
  "/resend-otp",
  validateBody(ownerSendOtp),
  OwnerController.resendOtphandler
);
ownerRouter.post(
  "/google",
  validateBody(OwnerGoogleLogin),
  OwnerController.handleGoogleClick
);
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

ownerRouter.get("/dashboard", OwnerController.fetchDashboardHandler);
