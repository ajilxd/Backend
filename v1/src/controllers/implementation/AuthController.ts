import { catchAsync } from "../../errors/catchAsyc";
import { IAuthController } from "../interface/IAuthController";
import { Request, Response, NextFunction } from "express";
import OTPService from "../../services/implementation/OTPService";
import { IOTPService } from "../../services/interface/IOTPService";
import ManagerService from "../../services/implementation/ManagerService";
import { IManagerService } from "../../services/interface/IManagerService";
import { sendResponse } from "../../utils/sendResponse";
import { successMap, SuccessType } from "../../constants/response.succesful";
import AppError from "../../errors/appError";
import { errorMap, ErrorType } from "../../constants/response.failture";
import { IUserService } from "../../services/interface/IUserService";
import UserService from "../../services/implementation/UserService";
import { IAuthService } from "../../services/interface/IAuthService";
import AuthService from "../../services/implementation/AuthService";
import { IOwnerService } from "../../services/interface/IOwnerService";
import OwnerService from "../../services/implementation/OwnerService";
import { logger } from "../../utils/logger";
import { ICompanyService } from "../../services/interface/ICompanyService";
import CompanyService from "../../services/implementation/CompanyService";

class AuthController implements IAuthController {
  private OTPService: IOTPService;
  private ManagerService: IManagerService;
  private UserService: IUserService;
  private AuthService: IAuthService;
  private OwnerService: IOwnerService;
  private CompanyService: ICompanyService;

  constructor(
    OTPService: IOTPService,
    ManagerService: IManagerService,
    UserService: IUserService,
    AuthService: IAuthService,
    OwnerService: IOwnerService,
    CompanyService: ICompanyService
  ) {
    this.OTPService = OTPService;
    this.ManagerService = ManagerService;
    this.UserService = UserService;
    this.AuthService = AuthService;
    this.OwnerService = OwnerService;
    this.CompanyService = CompanyService;
  }

  sendOtp = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { role } = req.query;
      const { email } = req.body;
      if (!email) {
        throw new AppError("Email is required", 400, "warn");
      }
      if (role === "manager") {
        const hasManagerAccount = Boolean(
          await this.ManagerService.findManagerByEmail(email)
        );
        if (!hasManagerAccount) {
          throw new AppError(
            "No manager account found with this email",
            404,
            "warn"
          );
        }
      } else if (role === "user") {
        const hasUserAccount = Boolean(
          await this.UserService.getUserByemail(email)
        );
        if (!hasUserAccount) {
          throw new AppError(
            "No user account found with this email",
            404,
            "warn"
          );
        }
      }
      await this.OTPService.sendOTP(email);

      return sendResponse(res, 200, `Otp has been send to your inbox`);
    }
  );

  login = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { email, otp } = req.body;
      const { role } = req.query;
      if (!email || !otp) {
        throw new AppError("Bad request - missing email or otp", 400, "warn");
      }

      if (role === "manager") {
        const manager = (
          await this.ManagerService.findManagerByEmail(email)
        ).toObject();
        const owner = await this.OwnerService.fetchOwnerById(
          manager.ownerId
        );
        if (!owner) {
          throw new AppError(
            "Couldnt fetch owner details for the user",
            500,
            "error"
          );
        }
        const company = await this.CompanyService.findCompanyByOwnerId(
          "" + owner._id
        );
        if (!company) {
          throw new AppError(
            "failed fetching company details at manager login",
            500,
            "error"
          );
        }
        if (manager.isBlocked) {
          return sendResponse(res, 403, "Your account is blocked");
        }

        const validOtp = await this.OTPService.authOTPverify(email, role, otp);
        if (!validOtp) {
          throw new AppError("Invalid OTP", 403, "warn");
        }

        const { accessToken, refreshToken } =
          await this.AuthService.authenticateUser(email, "manager");
        const result = {
          name: manager.name,
          image: manager.image,
          id: manager._id,
          email: manager.email,
          ownerId: owner?._id,
          ownerName: owner?.name,
          ownerSubscription: owner?.subscription,
          role: "manager",
          companyId: company?._id,
          companyName: company?.companyName,
          spaces:manager.spaces
        };
        return res
          .status(200)
          .cookie("managerRefreshToken", refreshToken, {
            httpOnly: true,
            maxAge: 7 * 24 * 60 * 60 * 1000,
          })

          .json({ accessToken, data: result });
      } else if (role === "user") {
        const user = await this.UserService.getUserByemail(email);
        const manager = await this.ManagerService.findManagerById(
          "" + user.managerId
        );
        const owner = await this.OwnerService.fetchOwnerById(""+user.ownerId);

        if (!owner) {
          throw new AppError(
            "Couldnt fetch owner details for the user",
            500,
            "error"
          );
        }

        const company = await this.CompanyService.findCompanyByOwnerId(
          "" + owner._id
        );
        if (!company) {
          throw new AppError(
            "failed fetching company details at manager login",
            500,
            "error"
          );
        }

        if (user.isBlocked) {
          return sendResponse(res, 403, "Your account is blocked");
        }

        const validOtp = await this.OTPService.authOTPverify(email, role, otp);
        if (!validOtp) {
          throw new AppError(
            "Invalid OTP - you have enterd an invalid otp",
            401,
            "warn"
          );
        }

        const { accessToken, refreshToken } =
          await this.AuthService.authenticateUser(email, "user");
        if (owner && manager && user) {
          const result = {
            ownerId: owner._id,
            ownerSubscription: owner.subscription,
            ownerName: owner.name,
            managerImage: manager.image,
            managerName: manager.name,
            name: user.name,
            id: user.id,
            image: user.image,
            role: "user",
            companyId: company._id,
            companyName: company.companyName,
          };

          res
            .status(200)
            .cookie("userRefreshToken", refreshToken, {
              httpOnly: true,
              maxAge: 7 * 24 * 60 * 60 * 1000,
            })
            .json({ accessToken, data: result });
        }
      } else {
        throw new AppError("Invalid role", 400, "warn");
      }
    }
  );

  logout = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { role } = req.query;

      if (role === "manager") {
        res.clearCookie("managerRefreshToken", { httpOnly: true });
      } else if (role === "user") {
        res.clearCookie("userRefreshToken", { httpOnly: true });
      } else {
        return sendResponse(res, 400, "Invalid role");
      }

      return res.status(200).json({ status: "success" });
    }
  );
}

export default new AuthController(
  OTPService,
  ManagerService,
  UserService,
  AuthService,
  OwnerService,
  CompanyService
);
