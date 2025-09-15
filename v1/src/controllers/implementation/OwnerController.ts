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
import { errorMap, ErrorType } from "../../constants/response.failture";
import { successMap, SuccessType } from "../../constants/response.succesful";
import { clearCookie, sendCookie } from "../../utils/JWT";
import { plainToInstance } from "class-transformer";
import { ownerLoginResponseDto } from "../../dtos/owner/OwnerLoginResponse.dto";
import { OwnerGetSubscriptionsResponse } from "../../dtos/owner/OwnerGetSubscriptionsResponse.dto";
import { AccountResponse } from "../../dtos/helperDtos/AccountResponse.dto";
import { OwnerGetAllManagerResponse } from "../../dtos/owner/OwnerGetAllManagerResponse.dto";
import { ISubscriber } from "../../entities/ISubscriber";
import { OwnerSubscriptionResponse } from "../../dtos/owner/OwnerSubscriptionResponse.dto";

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
      const { name, email } = req.body;
      const existingOwner = await this.OwnerService.findOwnerByEmail(email);
      const existingManager = await this.ManagerService.fetchManagerByEmail(
        email
      );
      const existingUser = await this.UserService.findUserByEmail(email);
      const duplicateMail = existingOwner || existingManager || existingUser;

      if (duplicateMail) {
        throw new AppError(
          errorMap[ErrorType.conflict].message,
          errorMap[ErrorType.conflict].code,
          "warn"
        );
      }

      const owner = await this.OwnerService.createOwner(req.body);

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
  );

  authenticateOtp = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { email, otp } = req.body;

      await otpService.verifyOTP(email, otp);

      sendResponse(
        res,
        successMap[SuccessType.Ok].code,
        successMap[SuccessType.Ok].message
      );
    }
  );

  loginUser = catchAsync(
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const { email, password } = req.body;
      const { accessToken, refreshToken, account } =
        await this.OwnerService.authenticateOwner(email, password);
      const subscription = await this.SubscriberService.findByCustomerId(
        "" + account._id
      );

      const payload = plainToInstance(
        ownerLoginResponseDto,
        {
          ...account.toObject(),
          companyId: account.company.companyId,
          companyName: account.company.companyName,
          subscription,
          accessToken,
        },
        { excludeExtraneousValues: true }
      );

      sendCookie(res, "owner", refreshToken);
      return sendResponse(
        res,
        successMap[SuccessType.Ok].code,
        successMap[SuccessType.Ok].message,
        payload
      );
    }
  );

  logoutUser = catchAsync(
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      clearCookie(res, "owner");

      return sendResponse(
        res,
        successMap[SuccessType.Ok].code,
        successMap[SuccessType.Ok].message
      );
    }
  );

  requestOtp = catchAsync(
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const { email } = req.body;

      await otpService.sendOTP(email);
      return sendResponse(
        res,
        successMap[SuccessType.Created].code,
        successMap[SuccessType.Created].message
      );
    }
  );

  resendOtp = catchAsync(
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const { email } = req.body;

      await otpService.deleteOtp(email);
      await otpService.sendOTP(email);
      return sendResponse(
        res,
        successMap[SuccessType.Created].code,
        successMap[SuccessType.Created].message
      );
    }
  );

  handleGoogleClick = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { email } = req.body;
      const account = await this.OwnerService.findOwnerByEmail(email);
      if (account) {
        const { accessToken, refreshToken } =
          await this.OwnerService.authenticateOwner(email, "", true);
        if (account.isBlocked) {
          throw new AppError(
            errorMap[ErrorType.Forbidden].message,
            errorMap[ErrorType.Forbidden].code,
            "warn"
          );
        }

        const subscription = await this.SubscriberService.findByCustomerId(
          "" + account._id
        );

        const payload = plainToInstance(
          ownerLoginResponseDto,
          {
            ...account.toObject(),
            companyId: account.company.companyId,
            companyName: account.company.companyName,
            subscription,
            accessToken,
          },
          { excludeExtraneousValues: true }
        );
        sendCookie(res, "owner", refreshToken);
        sendResponse(
          res,
          successMap[SuccessType.Ok].code,
          successMap[SuccessType.Ok].message,
          payload
        );
      } else {
        const generatedPassword = String(Math.random().toString(36).slice(-8));
        const newAccount: Partial<IOwner> = {
          name: "Guest",
          email: req.body.email,
          password: generatedPassword,
          isVerified: true,
          isBlocked: false,
        };

        let account = await this.OwnerService.createOwner(newAccount);

        const { name, email } = account;
        const cd = await stripeInstance.customers.create({
          email,
          name,
          metadata: { userId: "" + account._id },
        });

        account = await this.OwnerService.updateOwner("" + account._id, {
          stripe_customer_id: cd.id,
        });

        const { accessToken, refreshToken } =
          await this.OwnerService.authenticateOwner(email, "", true);
        const payload = plainToInstance(
          ownerLoginResponseDto,
          {
            ...account.toObject(),
            subscription: null,
            accessToken,
          },
          { excludeExtraneousValues: true }
        );
        sendCookie(res, "owner", refreshToken);
        sendResponse(
          res,
          successMap[SuccessType.Ok].code,
          successMap[SuccessType.Ok].message,
          payload
        );
      }
    }
  );

  resetPassword = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { email, password, token } = req.body;
      await this.TokenService.verifyToken(email, token);
      await this.OwnerService.resetPassword(email, password);
      await this.TokenService.deleteToken(email);
      logger.info("Password reset succesfully for ", email);
      return sendResponse(
        res,
        successMap[SuccessType.Ok].code,
        successMap[SuccessType.Ok].message
      );
    }
  );

  forgotPassword = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { email } = req.body;

      const user = await this.OwnerService.findOwnerByEmail(email);
      if (!user) {
        throw new AppError(
          errorMap[ErrorType.NotFound].message,
          errorMap[ErrorType.NotFound].code,
          "warn"
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

  updateProfile = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { id } = req.user;
      const updated = await this.OwnerService.updateOwner(id, req.body);

      return sendResponse(
        res,
        successMap[SuccessType.Ok].code,
        successMap[SuccessType.Ok].message,
        updated
      );
    }
  );

  addManager = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { id } = req.user;
      const validOwner = await this.OwnerService.fetchOwnerById(id);
      if (!validOwner) {
        throw new AppError(
          `No owner account found with this id - ${id}`,
          errorMap[ErrorType.NotFound].code,
          "warn"
        );
      }
      const { email } = req.body;
      const existingOwner = await this.OwnerService.findOwnerByEmail(email);
      const existingManager = await this.ManagerService.fetchManagerByEmail(
        email
      );
      const existingUser = await this.UserService.findUserByEmail(email);
      if (existingManager || existingOwner || existingUser) {
        return sendResponse(res, 409, "existing email");
      }

      const managerData = await this.ManagerService.createManager({
        ...req.body,
        companyName: validOwner.company.companyName,
        ownerId: id,
        companyId: validOwner.company.companyId,
      });

      const payload = plainToInstance(AccountResponse, managerData, {
        excludeExtraneousValues: true,
      });

      sendResponse(
        res,
        successMap[SuccessType.Created].code,
        successMap[SuccessType.Created].message,
        payload
      );
    }
  );

  getAllManagers = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { id } = req.user;
      const managers = await this.ManagerService.getManagers(id);
      const payload = plainToInstance(
        OwnerGetAllManagerResponse,
        { managers },
        {
          excludeExtraneousValues: true,
        }
      );
      sendResponse(
        res,
        successMap[SuccessType.Ok].code,
        successMap[SuccessType.Ok].message,
        payload
      );
    }
  );

  toggleManagerStatus = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { id: ownerId } = req.user;
      const { id: managerId } = req.params;
      const managerData = await this.ManagerService.findManagerById(managerId);
      const payload = plainToInstance(AccountResponse, managerData, {
        excludeExtraneousValues: true,
      });
      if (managerData && managerData.ownerId == ownerId) {
        const data = await this.ManagerService.toggleManagerStatus(
          managerData.email
        );
        return sendResponse(
          res,
          successMap[SuccessType.Ok].code,
          successMap[SuccessType.Ok].message,
          payload
        );
      }
    }
  );

  showSubscriptions = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const subscriptions = await this.SubscriptionService.fetchSubscriptions();
      const payload = plainToInstance(
        OwnerGetSubscriptionsResponse,
        { subscriptions },
        { excludeExtraneousValues: true }
      );

      return sendResponse(
        res,
        successMap[SuccessType.Ok].code,
        successMap[SuccessType.Ok].message,
        payload
      );
    }
  );

  fetchOwner = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { id: ownerId } = req.user;

      const owner = await this.OwnerService.fetchOwnerById(ownerId);

      if (!owner) {
        return sendResponse(
          res,
          errorMap[ErrorType.NotFound].code,
          errorMap[ErrorType.NotFound].message
        );
      }
      const payload = plainToInstance(ownerLoginResponseDto, owner, {
        excludeExtraneousValues: true,
      });
      return sendResponse(
        res,
        successMap[SuccessType.Ok].code,
        successMap[SuccessType.Ok].message,
        payload
      );
    }
  );

  getOwnerSubscription = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { id: ownerId } = req.user;
      const OwnerSubscriber = await this.SubscriberService.findByCustomerId(
        ownerId
      );

      if (!OwnerSubscriber) {
        throw new AppError(
          "No subscription found for the Owner",
          errorMap[ErrorType.NotFound].code,
          "warn"
        );
      }
      const plainObj = OwnerSubscriber.toObject();
      const stripeSubscriptionData =
        await stripeInstance.subscriptions.retrieve(
          OwnerSubscriber.stripe_subscription_id
        );

      const result = {
        ...plainObj,
        status: stripeSubscriptionData.status,
        features: OwnerSubscriber.features,
      };

      const payload = plainToInstance(OwnerSubscriptionResponse, result, {
        excludeExtraneousValues: true,
      });

      return sendResponse(
        res,
        successMap[SuccessType.Ok].code,
        successMap[SuccessType.Ok].message,
        payload
      );
    }
  );

  fetchOwnerInvoices = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { id } = req.params;
      let { page = 1 } = req.query;
      page = +page;
      const itemPerPage = 10;
      if (!id) {
        throw new AppError("No owner id found at path params", 400, "warn");
      }

      if (Number.isNaN(page)) {
        throw new AppError("invalid page query", 400);
      }

      const invoices = await this.InvoiceService.fetchInvoicesBycustomerId(id);
      const totalPage = Math.ceil(invoices.length / itemPerPage);
      const skip = (page - 1) * itemPerPage;
      const paginatedData = invoices.slice(skip, skip + itemPerPage);
      sendResponse(
        res,
        200,
        `Succesfully fetched invoices data for the owner id - ${id}`,
        { totalPage, invoices: paginatedData }
      );
    }
  );

  editManager = catchAsync(
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

  fetchDashboard = catchAsync(
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
