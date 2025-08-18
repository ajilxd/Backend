import { Router } from "express";
import OwnerController from "../controllers/implementation/OwnerController";
import CompanyController from "../controllers/implementation/CompanyController";
import authMiddleware from "../middleware/auth";
import { validateBody } from "../middleware/requestValidator";
import { OwnerLoginDto } from "../dtos/owner/OwnerLogin.dto";
import { OwnerOtpVerfication } from "../dtos/owner/OwnerOtpVerification.dto";
import { OwnerSendOtp } from "../dtos/owner/OwnerSendOtp.dto";
import { OwnerGoogleLogin } from "../dtos/owner/OwnerGoogleLogin.dto";
import { OwnerRegister } from "../dtos/owner/OwnerRegister.dto";
import { OwnerForgetpassword } from "../dtos/owner/OwnerForgetPassword.dto";
import { OwnerResetPassword } from "../dtos/owner/OwnerResetPassword.dto";
import { OwnerAddManager } from "../dtos/owner/OwnerAddManager.dto";
import { OwnerGetByFieldquery } from "../dtos/owner/OwnerGetByFieldquery.dto";
import { validateQuery } from "../middleware/requestQueryValidator";
import { CreateCompany } from "../dtos/company/CreateCompany.dto";
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
  OwnerController.authenticateOtp
);
ownerRouter.post(
  "/request-otp",
  validateBody(OwnerSendOtp),
  OwnerController.requestOtp
);
ownerRouter.post(
  "/resend-otp",
  validateBody(OwnerSendOtp),
  OwnerController.resendOtp
);
ownerRouter.post(
  "/google",
  validateBody(OwnerGoogleLogin),
  OwnerController.handleGoogleClick
);
ownerRouter.post(
  "/forget-password",
  validateBody(OwnerForgetpassword),
  OwnerController.forgotPassword
);
ownerRouter.post(
  "/reset-password",
  validateBody(OwnerResetPassword),
  OwnerController.resetPassword
);

ownerRouter.get(
  "/",
  authMiddleware(["owner"]),
  validateQuery(OwnerGetByFieldquery),
  OwnerController.getOwnersByField
);

ownerRouter.put(
  "/profile",
  authMiddleware(["owner"]),
  OwnerController.updateProfile
);
ownerRouter.post(
  "/managers",
  authMiddleware(["owner"]),
  validateBody(OwnerAddManager),
  OwnerController.addManager
);
ownerRouter.get(
  "/managers",
  authMiddleware(["owner"]),
  OwnerController.getAllManagers
);
ownerRouter.patch(
  "/managers/:id",
  authMiddleware(["owner"]),
  OwnerController.toggleManagerStatus
);

ownerRouter.put(
  "/manager",
  authMiddleware(["owner"]),
  OwnerController.editManager
);
ownerRouter.get(
  "/subscriptions",
  authMiddleware(["owner"]),
  OwnerController.showSubscriptions
);
ownerRouter.get(
  "/owners/:id",
  authMiddleware(["owner"]),
  OwnerController.showOwners
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

// company
ownerRouter.get(
  "/company/:id",
  authMiddleware(["owner"]),
  CompanyController.getCompany
);
ownerRouter.put(
  "/company",
  authMiddleware(["owner"]),
  CompanyController.updateCompany
);
ownerRouter.post(
  "/company",
  authMiddleware(["owner"]),
  validateBody(CreateCompany),
  CompanyController.registerCompany
);

ownerRouter.get("/dashboard", OwnerController.fetchDashboard);
