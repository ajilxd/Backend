import { Request, Response, NextFunction } from "express";
import { IAdminController } from "../interface/IAdminController";
import AdminService from "../../services/implementation/AdminService";
import OwnerService from "../../services/implementation/OwnerService";
import { IOwnerService } from "../../services/interface/IOwnerService";
import { IAdminService } from "../../services/interface/IAdminService";
import { catchAsync } from "../../errors/catchAsyc";
import { sendResponse } from "../../utils/sendResponse";
import { logger } from "../../utils/logger";
import { IManagerService } from "../../services/interface/IManagerService";
import { IUserService } from "../../services/interface/IUserService";
import ManagerService from "../../services/implementation/ManagerService";
import UserService from "../../services/implementation/UserService";
import { AccountType } from "../../types";
import AppError from "../../errors/appError";
import { IManager } from "../../entities/IManager";
import { ITransactionService } from "../../services/interface/ITransactionService";
import TransactionService from "../../services/implementation/TransactionService";
import { ITransaction } from "../../entities/ITransaction";
import { ISubscription } from "../../entities/ISubscription";
import { ISubscriptionService } from "../../services/interface/ISubscriptionService";
import SubscriptionService from "../../services/implementation/SubscriptionService";

interface userCount {
  userCount?: number;
}

type SubscriptionAdminType = ISubscription & userCount;

class AdminController implements IAdminController {
  private AdminService: IAdminService;
  private OwnerService: IOwnerService;
  private ManagerService: IManagerService;
  private UserService: IUserService;
  private TransactionService: ITransactionService;
  private SubscripitonService: ISubscriptionService;
  constructor(
    AdminService: IAdminService,
    OwnerService: IOwnerService,
    ManagerService: IManagerService,
    UserService: IUserService,
    TransactionService: ITransactionService,
    SubscriptionService: ISubscriptionService
  ) {
    this.AdminService = AdminService;
    this.OwnerService = OwnerService;
    this.ManagerService = ManagerService;
    this.UserService = UserService;
    this.TransactionService = TransactionService;
    this.SubscripitonService = SubscriptionService;
  }

  loginAdmin = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { email, password } = req.body;
      const { accessToken, refreshToken } =
        await this.AdminService.authenticateAdmin(email, password);
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        sameSite: "lax",
        secure: false,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
      return res.json({ accessToken });
    }
  );

  logoutAdmin = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      res.cookie("refreshToken", "", {
        httpOnly: true,
        expires: new Date(0),
      });
      await this.AdminService.clearRefreshToken();
      sendResponse(res, 200, "logout went succesfull");
    }
  );

  showOwners = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const page = Number(req.query.page) || 1;
      const itemPerPage = Number(req.query.itemPerPage) || 5;

      const users = await this.OwnerService.getOwners();
      const totalPage = Math.ceil(users.length / itemPerPage);
      logger.info({ length: users.length, totalPage });
      const skip = (page - 1) * itemPerPage;
      const paginatedUsers = users.slice(skip, skip + itemPerPage);
      return sendResponse(res, 200, `Succesfully fetched owners`, {
        users: paginatedUsers,
        totalPage,
      });
    }
  );

  toggleOwnerStatus = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      let { id } = req.params;

      if (id) {
        const updatedOwner = await this.OwnerService.updateOwnerStatus(id);
        res.status(200).json({ status: "success", data: updatedOwner });
      }
    }
  );

  fetchAllusersHandler = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const search = (req.query.search as string)?.trim().toLowerCase();
      const status = (req.query.status as string)?.trim().toLowerCase();
      const role = (req.query.role as string)?.trim().toLowerCase();
      const page = +(req.query.page as string)?.trim().toLowerCase() || 1;
      const itemPerPage = +(req.query.itemPerPage as string) || 10;

      if (!page || !itemPerPage) {
        throw new AppError(
          "Bad request - page/itemPerpage missing",
          400,
          "warn"
        );
      }
      let owners = await this.OwnerService.getOwners();
      let managers = await this.ManagerService.getAllManagers();
      let users = await this.UserService.getUsers();
      let accounts: AccountType[] = [];
      owners.map((i) => {
        accounts.push({
          role: "owner",
          name: i.name,
          image: i.image,
          userId: "" + i._id,
          company: i.company.companyName,
          status: i.isBlocked ? "inactive" : "active",
          joinedAt: i.createdAt,
        });
      });
      users.map((i) => {
        accounts.push({
          role: "user",
          name: i.name,
          image: i.image!,
          userId: "" + i._id,
          company: i.companyName,
          status: i.isBlocked ? "inactive" : "active",
          joinedAt: i.createdAt,
        });
      });
      managers.map((i) => {
        accounts.push({
          role: "manager",
          name: i.name,
          image: i.image!,
          userId: "" + i._id,
          company: i.companyName,
          status: i.isBlocked ? "inactive" : "active",
          joinedAt: i.createdAt,
        });
      });

      if (role && role !== "") {
        accounts = accounts.filter((i) => i.role.toLowerCase() === role);
      }

      if (search && search !== "") {
        accounts = accounts.filter(
          (i) =>
            i.name.toLowerCase().includes(search) ||
            i.company.toLowerCase().includes(search)
        );
      }

      if (status && status !== "") {
        accounts = accounts.filter((i) => i.status === status);
      }

      const totalPage = Math.ceil(accounts.length / itemPerPage);
      const skip = (page - 1) * itemPerPage;
      const paginatedAccounts = accounts.slice(skip, skip + itemPerPage);
      sendResponse(res, 200, "Succesfully fetched all users", {
        users: paginatedAccounts,
        totalPage,
      });
    }
  );

  BlockUser = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { role, id, block } = req.body;
      if (!role || !id || !("block" in req.body)) {
        console.log(req.body);
        throw new AppError(`Bad request - missing fields`, 400, "warn");
      }
      if (role === "user") {
        await this.UserService.updateUser(id, { isBlocked: block });
      } else if (role === "manager") {
        await this.ManagerService.updateManager(id, { isBlocked: block });
      } else if (role === "owner") {
        await this.OwnerService.updateOwner(id, { isBlocked: block });
      } else {
        throw new AppError(`Invalid role ${role}`, 400, "warn");
      }
      sendResponse(
        res,
        200,
        `succesfully updated the status of ${role} with  ${id}`
      );
    }
  );

  fetchAllTransactions = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const search = (req.query.search as string)?.trim().toLowerCase();
      const status = (req.query.status as string)?.trim().toLowerCase();
      const page = +(req.query.page as string) || 1;
      const itemPerPage = +(req.query.itemPerPage as string) || 10;
      let transactions: ITransaction[] =
        await this.TransactionService.fetchAll();

      if (status && status !== "") {
        transactions = transactions.filter(
          (i) => i.status.toLowerCase() === status
        );
      }

      if (search && search !== "") {
        transactions = transactions.filter(
          (i) =>
            i.companyName.toLowerCase().includes(search) ||
            i.customerName.toLowerCase().includes(search)
        );
      }
      const totalPage = Math.ceil(transactions.length / itemPerPage);
      const skip = (page - 1) * itemPerPage;
      const paginatedData = transactions.slice(skip, skip + itemPerPage);
      sendResponse(res, 200, "Succesfully fetched transactions", {
        transactions: paginatedData,
        totalPage,
      });
    }
  );

  fetchAllSubscriptions = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const search = (req.query.search as string)?.trim().toLowerCase();
      const status = (req.query.status as string)?.trim().toLowerCase();
      const billingCycle = (req.query.billingCycle as string)
        ?.trim()
        .toLowerCase();
      const page = +(req.query.page as string) || 1;
      const itemPerPage = +(req.query.itemPerPage as string) || 10;
      const transactions = await this.TransactionService.fetchAll();

      let subscriptions: SubscriptionAdminType[] =
        await this.SubscripitonService.fetchSubscriptions();

      const subIds = subscriptions.map((i) => "" + i._id);

      const subMap = new Map();
      for (let i of subIds) {
        let value = 0;
        for (let t of transactions) {
          if (
            t.status === "success" &&
            t.subscriptionId === i &&
            t.isInitial === true
          ) {
            value++;
          }
        }
        subMap.set(i, value);
      }

      subscriptions = subscriptions.map((i) => ({
        ...i.toObject(),
        userCount: subMap.get("" + i._id),
      }));

      if (status && status !== "") {
        subscriptions = subscriptions.filter((i) => {
          return i.isActive === (status === "active");
        });
      }

      if (search && search !== "") {
        subscriptions = subscriptions.filter((i) => {
          return i.name.toLowerCase().includes(search);
        });
      }

      if (billingCycle && billingCycle !== "") {
        subscriptions = subscriptions.filter((i) => {
          return i.billingCycleType === billingCycle;
        });
      }

      const totalPage = Math.ceil(subscriptions.length / itemPerPage);
      const skip = (page - 1) * itemPerPage;
      const paginatedData = subscriptions.slice(skip, skip + itemPerPage);
      console.log("data after pagination", paginatedData);

      sendResponse(res, 200, "Successfully fetched subscriptions", {
        subscriptions: paginatedData,
        totalPage,
      });
    }
  );
}

export default new AdminController(
  AdminService,
  OwnerService,
  ManagerService,
  UserService,
  TransactionService,
  SubscriptionService
);
