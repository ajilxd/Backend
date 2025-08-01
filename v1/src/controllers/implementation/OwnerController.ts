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
import { ISubscriptionService } from "../../services/interface/ISubscriptionService";
import mongoose from "mongoose";
import { stripeInstance } from "../..";
import AppError from "../../errors/appError";
import { sendResponse } from "../../utils/sendResponse";
import { logger } from "../../utils/logger";
import { IOwner } from "../../entities/IOwner";
import { IUserService } from "../../services/interface/IUserService";
import UserService from "../../services/implementation/UserService";
import { ISubscriberService } from "../../services/interface/ISubscriberService";
import SubscriberService from "../../services/implementation/SubscriberService";
import { ISpaceService } from "../../services/interface/ISpaceService";
import SpaceService from "../../services/implementation/SpaceService";
import { ITaskService } from "../../services/interface/ITaskService";
import TaskService from "../../services/implementation/TaskService";
import { IInvoiceService } from "../../services/interface/IInvoiceService";
import InvoiceService from "../../services/implementation/InvoiceService";

class OwnerController implements IOwnerController {
  constructor(
    private OwnerService: IOwnerService,
    private TokenService: ITokenService,
    private ManagerService: IManagerService,
    private SubscriptionService: ISubscriptionService,
    private UserService: IUserService,
    private SubscriberService: ISubscriberService,
    private SpaceService: ISpaceService,
    private TaskService: ITaskService,
    private InvoiceService: IInvoiceService
  ) {}

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
      const managerData = await this.ManagerService.createManager({
        ...req.body,
        companyName: validOwner.company.companyName,
      });

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

      const subscriptionData =
        await this.SubscriptionService.findSubscriptionById(
          ownerData.subscription.subscription_id!
        );

      const stripeSubscriptionData =
        await stripeInstance.subscriptions.retrieve(
          ownerData.subscription.stripe_subscription_id
        );

      const subscription = plainOwnerData.subscription;
      const result = {
        ...subscription,
        status: stripeSubscriptionData.status,
        cancel_at_period_end: new Date(
          stripeSubscriptionData.current_period_end * 1000
        ),
        cancel_at: new Date(stripeSubscriptionData.cancel_at! * 1000),
        canceled_at: new Date(stripeSubscriptionData.canceled_at! * 1000),
        features: subscriptionData.features,
      };
      console.log("result form owner sub", result);
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

      const invoices = await this.InvoiceService.fetchInvoicesBycustomerId(id);

      sendResponse(
        res,
        200,
        `Succesfully fetched invoices data for the owner id - ${id}`,
        invoices
      );
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
        throw new AppError("No users found", 404, "warn");
      }
    }
  );

  editManagerHandler = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const email = req.body.email;
      const name = req.body.name;
      const managerId = req.body.id;
      if (!managerId) {
        throw new AppError("Bad request", 400, "warn");
      }
      if (!email || !name) {
        throw new AppError("Bad request", 400, "warn");
      }

      const updated = await this.ManagerService.updateManager("" + managerId, {
        email,
        name,
      });
      return sendResponse(
        res,
        200,
        `Manager updation went  succesfully`,
        updated
      );
    }
  );

  fetchDashboardHandler = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { ownerId } = req.query;
      if (!ownerId) {
        throw new AppError("Owner id is missing", 400, "warn");
      }
      let ownerObjectId;
      if (typeof ownerId !== "string") {
        throw new AppError("invalid ownerid", 400, "warn");
      }
      ownerObjectId = new mongoose.Types.ObjectId(ownerId);
      console.log("object id of ownerid", ownerObjectId);
      if (!ownerObjectId) {
        throw new AppError("Invalid ownerid", 400, "warn");
      }
      const ownerSubscription = await this.SubscriberService.findByCustomerId(
        "" + ownerObjectId
      );
      if (!ownerSubscription) {
        logger.info(`No subscription found with this owner Id (${ownerId})`);
      }

      const subscripitionData = {
        name: ownerSubscription?.name ?? "N/A",
        status: ownerSubscription?.status ?? "N/A",
        amount: ownerSubscription?.amount ?? "N/A",
        billingDate: ownerSubscription?.expiresAt ?? "N/A",
        validSubscription: !!ownerSubscription,
      };

      const ownManagers = (
        await this.ManagerService.getManagers("" + ownerObjectId)
      ).length;
      const ownUsers = (
        await this.UserService.getUsersQuery({
          ownerId: "" + ownerObjectId,
        })
      ).length;
      const ownSpaces = (
        await this.SpaceService.getSpaces({
          owner: "" + ownerObjectId,
        })
      ).length;

      const managerLimit = ownerSubscription?.features.managerCount;
      const userLimit = ownerSubscription?.features.userCount;
      const spaceLimit = ownerSubscription?.features.spaces;

      const quotaData = {
        ownManagers,
        ownUsers,
        ownSpaces,
        managerLimit,
        userLimit,
        spaceLimit,
      };
      const ownerSpacesRaw = await this.SpaceService.getSpaces({
        owner: "" + ownerObjectId,
      });

      const ownerSpaces = await Promise.all(
        ownerSpacesRaw.map(async (i) => ({
          name: i.name,
          users: (
            await this.UserService.getUsersQuery({ spaces: "" + i._id })
          ).length,
          managers: (
            await this.ManagerService.getManagersQuery({
              spaces: "" + i._id,
            })
          ).length,
          tasks: (
            await this.TaskService.getTasksQuery({ spaceId: "" + i._id })
          ).length,
        }))
      );
      const managerData = (
        await this.ManagerService.getManagers("" + ownerObjectId)
      ).map((i) => ({
        name: i.name,
        status: i.isBlocked ? "inactive" : "active",
        image: i.image,
      }));

      const payload = {
        subscripitionData,
        quotaData,
        ownerSpaces,
        managerData,
      };
      sendResponse(
        res,
        200,
        "succesfully fetched owner dashboard data",
        payload
      );
    }
  );
}

export default new OwnerController(
  OwnerService,
  TokenService,
  ManagerService,
  SubscriptionService,
  UserService,
  SubscriberService,
  SpaceService,
  TaskService,
  InvoiceService
);
