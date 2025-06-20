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
import mongoose from "mongoose";
import { stripeInstance } from "../..";
import AppError from "../../errors/appError";
import { sendResponse } from "../../utils/sendResponse";
import { logger } from "../../utils/logger";
import { IOwner } from "../../entities/IOwner";
import { IUserService } from "../../services/interface/IUserService";
import UserService from "../../services/implementation/UserService";

class OwnerController implements IOwnerController {
  private OwnerService: IOwnerService;
  private TokenService: ITokenService;
  private ManagerService: IManagerService;
  private SubscriptionService: ISubscriptionService<ISubscription<string>>;
  private UserService: IUserService;

  constructor(
    OwnerService: IOwnerService,
    TokenService: ITokenService,
    ManagerService: IManagerService,
    SubscriptionService: ISubscriptionService<ISubscription<string>>,
    UserService: IUserService
  ) {
    this.OwnerService = OwnerService;
    this.TokenService = TokenService;
    this.ManagerService = ManagerService;
    this.SubscriptionService = SubscriptionService;
    this.UserService = UserService;
  }

  registerOwner = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const existingOwner = await this.OwnerService.findOwnerByEmail(
        req.body.email
      );
      const existingManager = await this.ManagerService.fetchManagerByEmail(
        req.body.email
      );

      const existingUser = existingOwner || existingManager;

      if (existingUser) {
        throw new AppError("existing email", 409, "warn");
      }
      const formattedEmail = req.body.email.toLowerCase();
      const owner = await this.OwnerService.createOwner({
        ...req.body,
        email: formattedEmail,
      });
      if (!owner) {
        throw new AppError("Failed creating owner in db", 500, "error");
      }

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
        201,
        `owner account created succesfully for the user - ${owner.name} with id ${owner._id}`
      );
    }
  );

  AuthenticateOtp = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { email, otp } = req.body;

      const validUser = await otpService.verifyOTP(email, otp);

      logger.info(`otp verified for ${validUser.email}`);
      sendResponse(res, 200, "Otp verification was succesful");
    }
  );

  loginUser = catchAsync(
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const { email, password } = req.body;
      const { accessToken, refreshToken, account } =
        await this.OwnerService.authenticateOwner(email, password);
      res
        .status(200)
        .cookie("ownerRefreshToken", refreshToken, {
          httpOnly: true,
          maxAge: 7 * 24 * 60 * 60 * 1000,
          secure: false,
          sameSite: "lax",
          path: "/",
        })
        .json({ accessToken, data: account });
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

      return sendResponse(res, 201, "Logout went succesful - owner");
    }
  );

  requestOtpHandler = catchAsync(
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const { email } = req.body;

      await otpService.sendOTP(email);
      return sendResponse(res, 201, `Otp has been send to your email ${email}`);
    }
  );

  resendOtphandler = catchAsync(
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const { email } = req.body;

      await otpService.deleteOtp(email);
      await otpService.sendOTP(email);
      return sendResponse(
        res,
        201,
        `Otp has be resended to your email ${email}`
      );
    }
  );

  handleGoogleClick = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { email } = req.body;
      const existingUser = await this.OwnerService.findOwnerByEmail(email);
      if (existingUser) {
        const accountData = existingUser;

        const { accessToken, refreshToken } =
          await this.OwnerService.authenticateOwner(email, "", true);
        if (accountData.isBlocked) {
          throw new AppError(
            `Your owner account(${accountData.name}) is disabled`,
            403,
            "warn"
          );
        }

        res.status(200).cookie("ownerRefreshToken", refreshToken, {
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
          200,
          `password has been succesfully reset - ${email}`
        );
      } else {
        return sendResponse(
          res,
          401,
          "Invalid link or expired link - you have used an expired or invalid password link"
        );
      }
    }
  );

  forgotPasswordHandler = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { email } = req.body;

      const user = await this.OwnerService.findOwnerByEmail(email);
      if (!user) {
        throw new AppError(
          `No owner account found with this email ${email}`,
          404,
          "warn"
        );
      }
      await this.TokenService.createPasswordToken(email);
      return sendResponse(res, 200, `Password link has been sent your email`);
    }
  );

  updateProfile = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { ownerId } = req.body;
      const updated = await this.OwnerService.updateOwner(ownerId, req.body);

      return sendResponse(
        res,
        200,
        "Owner profile has been updated succesfully",
        updated
      );
    }
  );

  addManagerHandler = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { ownerId, email } = req.body;
      const existingOwner = await this.OwnerService.findOwnerByEmail(email);
      const existingManager = await this.ManagerService.fetchManagerByEmail(
        email
      );
      const existingUser = await this.UserService.findUserByEmail(email);
      if (existingManager || existingOwner || existingUser) {
        return sendResponse(res, 409, "existing email");
      }

      const validOwner = await this.OwnerService.fetchOwnerById(ownerId);
      if (!validOwner) {
        throw new AppError(
          `No owner account found with this id - ${ownerId}`,
          404,
          "warn"
        );
      }
      const managerData = await this.ManagerService.createManager(req.body);

      sendResponse(
        res,
        201,
        `Manager account created for ${managerData.name} succesfully`,
        managerData
      );
    }
  );

  getAllManagersHandler = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { id } = req.params;
      const managers = await this.ManagerService.getManagers(id);
      if (managers) {
        if (managers.length > 0) {
          sendResponse(
            res,
            200,
            `Succesfully fetched managers with owner Id ${id}`,
            managers
          );
        } else {
          sendResponse(res, 204, `Found no managers for the Owner id ${id}`);
        }
      }
    }
  );

  toggleManagerStatusHandler = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { ownerId } = req.body;
      const { id } = req.params;
      const managerData = await this.ManagerService.findManagerById(id);
      if (managerData && managerData.ownerId == ownerId) {
        const data = await this.ManagerService.toggleManagerStatus(
          managerData.email
        );
        return sendResponse(
          res,
          200,
          `Manager(${managerData.name}) status has been succesfully updated `,
          data
        );
      }
    }
  );

  showSubscriptionsHandler = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const subscriptions = await this.SubscriptionService.fetchSubscriptions();
      if (subscriptions.length == 0) {
        return sendResponse(res, 204, "No subscriptions found");
      } else {
        return sendResponse(
          res,
          200,
          `subscriptions found ${subscriptions.length} in total`,
          subscriptions
        );
      }
    }
  );

  showOwnersHandler = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      if (!req.params.id) {
        throw new AppError("No owner id found in path params", 400, "warn");
      }
      const owner = await this.OwnerService.findOwnerByEmail(req.params.id);
      if (!owner) {
        return sendResponse(
          res,
          400,
          `No owner account found with this id - ${req.params.id}`
        );
      }
      return sendResponse(res, 200, `${owner.name}'s data`, owner);
    }
  );

  getOwnerSubscription = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      if (!req.params.id) {
        throw new AppError("No owner id found at path params", 400, "warn");
      }

      const ownerData = await this.OwnerService.fetchOwnerById(req.params.id);
      if (!ownerData) {
        throw new AppError(
          `No owner account found with this id ${req.params.id}`,
          404,
          "warn"
        );
      }

      if (!ownerData.subscription) {
        throw new AppError("No subscription found for the Owner", 404, "warn");
      }
      if (!ownerData.subscription.stripe_subscription_id) {
        throw new AppError(
          "failed to find the stripe subscription id",
          500,
          "warn"
        );
      }

      const plainOwnerData = ownerData.toObject();

      const stripeSubscriptionData =
        await stripeInstance.subscriptions.retrieve(
          ownerData.subscription.stripe_subscription_id
        );

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
        200,
        `Owner subscription data retrived succesfully`,
        result
      );
    }
  );

  fetchOwnerInvoices = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { id } = req.params;
      if (!id) {
        throw new AppError("No owner id found at path params", 400, "warn");
      }

      const ownerData = await this.OwnerService.fetchOwnerById(id);
      if (ownerData && ownerData.invoices) {
        const { invoices } = ownerData;
        sendResponse(
          res,
          200,
          `Succesfully fetched invoices data for the owner id - ${id}`,
          invoices
        );
      } else {
        sendResponse(res, 404, `No owner invoices found`);
      }
    }
  );

  getOwnersByFieldHandler = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      let { field, value } = req.query;
      if (typeof field !== "string" || typeof value !== "string") {
        throw new AppError("Bad request", 400);
      }
      const allowedFields = ["_id"];
      if (!allowedFields.includes("" + field)) {
        throw new AppError("Invalid query", 400);
      }

      const query: Record<string, mongoose.Types.ObjectId> = {};
      query[field] = new mongoose.Types.ObjectId(value);

      const result = await this.OwnerService.getOwnersQuery(query);

      if (result) {
        return sendResponse(res, 200, "fetched owners succesfully", result);
      } else {
        throw new AppError("No users found", 404);
      }
    }
  );
}

export default new OwnerController(
  OwnerService,
  TokenService,
  ManagerService,
  SubscriptionService,
  UserService
);
