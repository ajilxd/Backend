import { Request, Response, NextFunction } from "express";
import { IOwnerController } from "../interface/IOwnerController";
import OwnerService from "../../services/implementation/OwnerService";
import { IOwnerService } from "../../services/interface/IOwnerService";
import { catchAsync } from "../../errors/catchAsyc";
import otpService from "../../services/implementation/OTPService";
import TokenService from "../../services/implementation/TokenService";
import { ITokenService } from "../../services/interface/ITokenService";
import { IManagerService } from "../../services/interface/IManagerService";
import ManagerService from "../../services/implementation/ManagerService";
import SubscriptionService from "../../services/implementation/SubscriptionService";
import { ISubscription } from "../../entities/ISubscription";
import { ISubscriptionService } from "../../services/interface/ISubscriptionService";
import { Types } from "mongoose";
import { stripeInstance } from "../..";
import AppError from "../../errors/appError";
import { errorMap, ErrorType } from "../../constants/response.failture";
import { sendResponse } from "../../utils/sendResponse";
import { successMap, SuccessType } from "../../constants/response.succesful";
import { logger } from "../../utils/logger";
import { IOwner } from "../../entities/IOwner";

class OwnerController implements IOwnerController {
  private OwnerService: IOwnerService;
  private TokenService: ITokenService;
  private ManagerService: IManagerService;
  private SubscriptionService: ISubscriptionService<ISubscription<string>>;

  constructor(
    OwnerService: IOwnerService,
    TokenService: ITokenService,
    ManagerService: IManagerService,
    SubscriptionService: ISubscriptionService<ISubscription<string>>
  ) {
    this.OwnerService = OwnerService;
    this.TokenService = TokenService;
    this.ManagerService = ManagerService;
    this.SubscriptionService = SubscriptionService;
  }

  registerOwner = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const existingUser = await this.OwnerService.findOwnerByEmail(
        req.body.email
      );
      if (existingUser) {
        throw new AppError(
          errorMap[ErrorType.conflict].message,
          errorMap[ErrorType.conflict].code
        );
      }
      const owner = await this.OwnerService.createOwner(req.body);
      if (!owner) {
        throw new AppError(
          "Failed creating owner in db",
          errorMap[ErrorType.ServerError].code
        );
      }

      if (owner) {
        const { name, email } = owner;
        const stripeCustomerData = await stripeInstance.customers.create({
          email,
          name,
          metadata: { userId: "" + owner._id },
        });

        await this.OwnerService.updateOwner("" + owner._id, {
          stripe_customer_id: stripeCustomerData.id,
        });

        await otpService.sendOTP(email);

        return sendResponse(
          res,
          successMap[SuccessType.Created].code,
          successMap[SuccessType.Created].message
        );
      }
    }
  );

  AuthenticateOtp = catchAsync(
    async (req: Request, res: Response, next: NextFunction): Promise<any> => {
      //  create dto with email and otp
      const { email, otp } = req.body;

      const validUser = await otpService.verifyOTP(email, otp);
      if (!validUser) {
        logger.warn("invalid otp entered for ", email);
        sendResponse(
          res,
          errorMap[ErrorType.Unauthorized].code,
          errorMap[ErrorType.Unauthorized].message
        );
      } else {
        logger.info(`otp verified for ${validUser.email}`);
        sendResponse(
          res,
          successMap[SuccessType.Ok].code,
          successMap[SuccessType.Ok].message
        );
      }
    }
  );

  loginUser = catchAsync(
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const { email, password } = req.body;
      const validUser = await this.OwnerService.checkOwner(email, password);

      if (!validUser.isVerified)
        throw new AppError(
          "Email should be verified",
          errorMap[ErrorType.Forbidden].code
        );

      if (validUser.isBlocked) {
        throw new AppError("Account got blocked", 401);
      }

      if (validUser) {
        const { accessToken, refreshToken } =
          await this.OwnerService.authenticateOwner(email, password);
        console.log({ accessToken, refreshToken });
        res
          .status(200)
          .cookie("ownerRefreshToken", refreshToken, {
            httpOnly: true,
            maxAge: 7 * 24 * 60 * 60 * 1000,
            secure: false,
            sameSite: "lax",
            path: "/",
          })
          .json({ accessToken, data: validUser });
      }
    }
  );

  logoutUser = catchAsync(
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      res.clearCookie("ownerRefreshToken", {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        path: "/",
      });

      return sendResponse(
        res,
        successMap[SuccessType.Accepted].code,
        successMap[SuccessType.Accepted].message
      );
    }
  );

  resendOtphandler = catchAsync(
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const { email } = req.body;

      await otpService.deleteOtp(email);
      await otpService.sendOTP(email);
      return sendResponse(
        res,
        successMap[SuccessType.Accepted].code,
        successMap[SuccessType.Accepted].message
      );
    }
  );

  handleGoogleClick = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      // request and response dto
      const { email } = req.body;
      const existingUser = await this.OwnerService.findOwnerByEmail(email);
      if (existingUser) {
        const accountData = existingUser;

        const { accessToken, refreshToken } =
          await this.OwnerService.authenticateOwner(email, "", true);
        if (accountData.isBlocked) {
          throw new AppError("Account is blocked", 403);
        }

        res
          .status(successMap[SuccessType.Ok].code)
          .cookie("ownerRefreshToken", refreshToken, {
            httpOnly: true,
            maxAge: 7 * 24 * 60 * 60 * 1000,
            sameSite: "lax",
            secure: false,
          });
        return res.json({ accessToken, data: accountData });
      } else {
        const generatedPassword = String(Math.random().toString(36).slice(-8));
        const accountData: Partial<IOwner> = {
          name: "Guest",
          email: req.body.email,
          password: generatedPassword,
          isVerified: true,
          isBlocked: false,
        };

        const owner = await this.OwnerService.createOwner(accountData);

        const { name, email } = owner;
        const cd = await stripeInstance.customers.create({
          email,
          name,
          metadata: { userId: "" + owner._id },
        });

        const updatedOwner = await this.OwnerService.updateOwner(
          "" + owner._id,
          {
            stripe_customer_id: cd.id,
          }
        );

        const { accessToken, refreshToken } =
          await this.OwnerService.authenticateOwner(email, "", true);
        res.cookie("ownerRefreshToken", refreshToken, {
          httpOnly: true,
          maxAge: 7 * 24 * 60 * 60 * 1000,
          sameSite: "lax",
          secure: false,
        });
        return res.json({ accessToken, data: updatedOwner });
      }
    }
  );

  resetPasswordHandler = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { email, password, token } = req.body;

      const validToken = await this.TokenService.verifyToken(email, token);

      if (validToken) {
        await this.OwnerService.resetPassword(validToken.email, password);
        logger.info("Password reset succesfully for ", email);
        await this.TokenService.deleteToken(email);
        return sendResponse(
          res,
          successMap[SuccessType.Ok].code,
          successMap[SuccessType.Ok].message
        );
      } else {
        return sendResponse(
          res,
          errorMap[ErrorType.Unauthorized].code,
          errorMap[ErrorType.Unauthorized].message
        );
      }
    }
  );

  forgotPasswordHandler = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { email } = req.body;
      if (!email) {
        throw new AppError(
          errorMap[ErrorType.ValidationError].message,
          errorMap[ErrorType.ValidationError].code
        );
      }
      const user = await this.OwnerService.findOwnerByEmail(email);
      if (!user) {
        throw new AppError(
          errorMap[ErrorType.NotFound].message,
          errorMap[ErrorType.NotFound].code
        );
      }
      await this.TokenService.createPasswordToken(email);
      return sendResponse(
        res,
        successMap[SuccessType.Ok].code,
        successMap[SuccessType.Ok].message
      );
    }
  );

  addManagerHandler = catchAsync(
    // dto
    async (req: Request, res: Response, next: NextFunction) => {
      console.log(req.body);
      const { ownerId } = req.body;

      if (!ownerId) {
        throw new AppError(
          errorMap[ErrorType.ValidationError].message,
          errorMap[ErrorType.ValidationError].code
        );
      }
      const validOwner = await this.OwnerService.fetchOwnerById(ownerId);
      console.log("hey valid owner");
      if (!validOwner) {
        throw new AppError(
          errorMap[ErrorType.NotFound].message,
          errorMap[ErrorType.NotFound].code
        );
      }
      const managerData = await this.ManagerService.createManager(req.body);
      if (!managerData) {
        throw new AppError(
          errorMap[ErrorType.ServerError].message,
          errorMap[ErrorType.ServerError].code
        );
      }
      sendResponse(
        res,
        successMap[SuccessType.Created].code,
        successMap[SuccessType.Created].message
      );
    }
  );

  getManagerHandler = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { id } = req.params;
      const validId = Types.ObjectId.isValid(id);
      if (validId) {
        const manager = await this.ManagerService.getManagers(id);
        if (manager) {
          return sendResponse(
            res,
            successMap[SuccessType.Accepted].code,
            successMap[SuccessType.Accepted].message,
            manager
          );
        } else {
          return sendResponse(
            res,
            successMap[SuccessType.NoContent].code,
            successMap[SuccessType.NoContent].message
          );
        }
      } else {
        return sendResponse(
          res,
          errorMap[ErrorType.ValidationError].code,
          errorMap[ErrorType.ValidationError].message
        );
      }
    }
  );

  getAllManagersHandler = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      // dto
      const { id } = req.params;
      const managers = await this.ManagerService.getManagers(id);
      if (managers) {
        if (managers.length > 0) {
          sendResponse(
            res,
            successMap[SuccessType.Ok].code,
            successMap[SuccessType.Ok].message,
            managers
          );
        } else {
          sendResponse(
            res,
            successMap[SuccessType.NoContent].code,
            successMap[SuccessType.NoContent].message
          );
        }
      } else {
        throw new AppError(
          errorMap[ErrorType.BadRequest].message,
          errorMap[ErrorType.BadRequest].code
        );
      }
    }
  );

  toggleManagerStatusHandler = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { ownerId } = req.body;
      const { id } = req.params;

      const validmanagerId = Types.ObjectId.isValid(id);
      const validOwnerId = Types.ObjectId.isValid(ownerId);
      if (!validOwnerId || !validmanagerId) {
        throw new AppError(
          errorMap[ErrorType.BadRequest].message,
          errorMap[ErrorType.BadRequest].code
        );
      }
      const managerData = await this.ManagerService.findManagerById(id);
      logger.info("blocking user..");
      if (managerData && managerData.ownerId == ownerId) {
        const data = await this.ManagerService.toggleManagerStatus(
          managerData.email
        );
        return sendResponse(
          res,
          successMap[SuccessType.Ok].code,
          successMap[SuccessType.Ok].message,
          data
        );
      }
    }
  );

  showSubscriptionsHandler = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const subscriptions = await this.SubscriptionService.fetchSubscriptions();
      if (subscriptions.length == 0) {
        return sendResponse(
          res,
          successMap[SuccessType.NoContent].code,
          successMap[SuccessType.NoContent].message
        );
      } else {
        return sendResponse(
          res,
          successMap[SuccessType.Ok].code,
          successMap[SuccessType.Ok].message,
          subscriptions
        );
      }
    }
  );

  showOwnersHandler = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      if (!req.params.id) {
        throw new AppError(
          errorMap[ErrorType.BadRequest].message,
          errorMap[ErrorType.BadRequest].code
        );
      }
      const owner = await this.OwnerService.findOwnerByEmail(req.params.id);
      if (!owner) {
        return sendResponse(
          res,
          errorMap[ErrorType.NotFound].code,
          errorMap[ErrorType.NotFound].message
        );
      }
      return sendResponse(
        res,
        successMap[SuccessType.Ok].code,
        successMap[SuccessType.Ok].message,
        owner
      );
    }
  );

  getOwnerSubscription = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      if (!req.params.id) {
        throw new AppError(
          errorMap[ErrorType.BadRequest].message,
          errorMap[ErrorType.BadRequest].code
        );
      }

      const ownerData = await this.OwnerService.fetchOwnerById(req.params.id);
      if (!ownerData) {
        throw new AppError("owner not found with input id", 404);
      }

      if (!ownerData.subscription) {
        throw new AppError(
          successMap[SuccessType.NoContent].message,
          successMap[SuccessType.NoContent].code
        );
      }
      if (!ownerData.subscription.stripe_subscription_id) {
        throw new AppError("failed to find the stripe subscription id", 500);
      }

      const plainOwnerData = ownerData.toObject();

      const stripeSubscriptionData =
        await stripeInstance.subscriptions.retrieve(
          ownerData.subscription.stripe_subscription_id
        );
      console.log(plainOwnerData);
      const subscription = plainOwnerData.subscription;
      const result = {
        ...subscription,
        status: stripeSubscriptionData.status,
        cancel_at_period_end: stripeSubscriptionData.cancel_at_period_end,
        cancel_at: stripeSubscriptionData.cancel_at,
        canceled_at: stripeSubscriptionData.canceled_at,
      };
      console.log("active subscription for " + req.params.id + "" + result);
      return sendResponse(
        res,
        successMap[SuccessType.Ok].code,
        successMap[SuccessType.Ok].message,
        result
      );
    }
  );

  fetchOwnerInvoices = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { id } = req.params;
      if (!id) {
        throw new AppError(
          errorMap[ErrorType.NotFound].message,
          errorMap[ErrorType.NotFound].code
        );
      }

      const ownerData = await this.OwnerService.fetchOwnerById(id);
      if (ownerData && ownerData.invoices) {
        const { invoices } = ownerData;
        sendResponse(
          res,
          successMap[SuccessType.Ok].code,
          successMap[SuccessType.Ok].message,
          invoices
        );
      } else {
        logger.info("Owner doesnt have invoices");
        sendResponse(
          res,
          successMap[SuccessType.NoContent].code,
          successMap[SuccessType.NoContent].message
        );
      }
    }
  );
}

export default new OwnerController(
  OwnerService,
  TokenService,
  ManagerService,
  SubscriptionService
);
