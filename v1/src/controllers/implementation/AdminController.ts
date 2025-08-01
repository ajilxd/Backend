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
import { ITransactionService } from "../../services/interface/ITransactionService";
import TransactionService from "../../services/implementation/TransactionService";
import { ITransaction } from "../../entities/ITransaction";
import { ISubscription } from "../../entities/ISubscription";
import { ISubscriptionService } from "../../services/interface/ISubscriptionService";
import SubscriptionService from "../../services/implementation/SubscriptionService";
import { ISubscriberService } from "../../services/interface/ISubscriberService";
import SubscriberService from "../../services/implementation/SubscriberService";
import { Transaction } from "../../schemas/transactionSchema";
import { ICompanyService } from "../../services/interface/ICompanyService";
import CompanyService from "../../services/implementation/CompanyService";
import { Subscription } from "../../schemas/subscriptionSchema";
import { Subscriber } from "../../schemas/subscriberSchema";
type MonthName =
  | "Jan"
  | "Feb"
  | "Mar"
  | "Apr"
  | "May"
  | "Jun"
  | "Jul"
  | "Aug"
  | "Sep"
  | "Oct"
  | "Nov"
  | "Dec";

type MonthData = {
  sales: number;
  revenue: number;
  newCustomers: number;
};

interface userCount {
  userCount?: number;
}

type SubscriptionAdminType = ISubscription & userCount;

class AdminController implements IAdminController {
  constructor(
    private AdminService: IAdminService,
    private OwnerService: IOwnerService,
    private ManagerService: IManagerService,
    private UserService: IUserService,
    private TransactionService: ITransactionService,
    private SubscriptionService: ISubscriptionService,
    private SubscriberService: ISubscriberService,
    private CompanyService: ICompanyService
  ) {}

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
        await this.SubscriptionService.fetchSubscriptions();

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

      sendResponse(res, 200, "Successfully fetched subscriptions", {
        subscriptions: paginatedData,
        totalPage,
      });
    }
  );

  fetchAllSubscribers = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const search = (req.query.search as string)?.trim().toLowerCase();
      const status = (req.query.status as string)?.trim().toLowerCase();
      const page = +(req.query.page as string) || 1;
      const itemPerPage = +(req.query.itemPerPage as string) || 10;
      let subscribers = await this.SubscriberService.fetchAll();

      if (status && status !== "") {
        subscribers = subscribers.filter((i) => {
          return i.status === status;
        });
      }
      if (search && search !== "") {
        subscribers = subscribers.filter((i) => {
          return (
            i.name.toLowerCase().includes(search) ||
            i.customerName.toLocaleLowerCase().includes(search)
          );
        });
      }

      const totalPage = Math.ceil(subscribers.length / itemPerPage);
      const skip = (page - 1) * itemPerPage;
      const paginatedData = subscribers.slice(skip, skip + itemPerPage);
      sendResponse(res, 200, "succesfully fetched all users subscription", {
        subscribers: paginatedData,
        totalPage,
      });
    }
  );

  fetchSalesReport = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const failedPaymentsCount = (
        await this.TransactionService.fetchAll()
      ).filter((i) => i.status === "fail").length;
      const upgradeCount = (await this.TransactionService.fetchAll()).filter(
        (i) => !!i.upgrade === true
      ).length;
      const totalRevenue = (await this.TransactionService.fetchAll())
        .filter((i) => i.status === "success")
        .reduce((sum, item) => sum + Number(item.amount), 0);
      const activeCustomersCount = (
        await this.TransactionService.fetchAll()
      ).filter(
        (i) => i.isInitial && !i.upgrade && i.status === "success"
      ).length;
      const lostCustomersCount = (
        await this.TransactionService.fetchAll()
      ).filter((i) => !!i.isCancled === true).length;

      const owners = await this.OwnerService.getOwners();
      const churnRate = Math.ceil((lostCustomersCount / owners.length) * 100);
      const subscriptionSalesData = await Transaction.aggregate([
        {
          $match: { status: "success" },
        },
        {
          $group: {
            _id: "$subscriptionName",
            count: { $sum: 1 },
          },
        },
      ]);

      const startOfYear = new Date(`${2025}-01-01T00:00:00Z`);
      const endOfYear = new Date(`${2025}-12-31T23:59:59Z`);

      const transactions = await Transaction.aggregate([
        {
          $match: {
            status: "success",
            createdAt: { $gte: startOfYear, $lte: endOfYear },
          },
        },
        {
          $group: {
            _id: { month: { $month: "$createdAt" } },
            revenue: { $sum: "$amount" },
            sales: { $count: {} },
            uniqueCustomers: { $addToSet: "$customerId" },
          },
        },
        {
          $project: {
            month: "$_id.month",
            sales: 1,
            revenue: 1,
            newCustomers: { $size: "$uniqueCustomers" },
          },
        },
        { $sort: { month: 1 } },
      ]);

      const monthsData: Record<MonthName, MonthData> = {
        Jan: { sales: 0, revenue: 0, newCustomers: 0 },
        Feb: { sales: 0, revenue: 0, newCustomers: 0 },
        Mar: { sales: 0, revenue: 0, newCustomers: 0 },
        Apr: { sales: 0, revenue: 0, newCustomers: 0 },
        May: { sales: 0, revenue: 0, newCustomers: 0 },
        Jun: { sales: 0, revenue: 0, newCustomers: 0 },
        Jul: { sales: 0, revenue: 0, newCustomers: 0 },
        Aug: { sales: 0, revenue: 0, newCustomers: 0 },
        Sep: { sales: 0, revenue: 0, newCustomers: 0 },
        Oct: { sales: 0, revenue: 0, newCustomers: 0 },
        Nov: { sales: 0, revenue: 0, newCustomers: 0 },
        Dec: { sales: 0, revenue: 0, newCustomers: 0 },
      };

      transactions.forEach((m) => {
        const monthNames = [
          "",
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ];
        const monthName = monthNames[m.month] as MonthName;
        monthsData[monthName].sales = m.sales;
        monthsData[monthName].revenue = m.revenue;
        monthsData[monthName].newCustomers = m.newCustomers;
      });

      const yearlyReport = Object.entries(monthsData).map(([month, data]) => ({
        month,
        ...data,
      }));

      const payload = {
        yearlyReport,
        churnRate,
        lostCustomersCount,
        activeCustomersCount,
        totalRevenue,
        upgradeCount,
        failedPaymentsCount,
        subscriptionSalesData,
      };
      sendResponse(res, 200, "data fetched succesfully", payload);
    }
  );

  fetchDashboard = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const totalRevenue = (await this.TransactionService.fetchAll())
        .filter((i) => i.status === "success")
        .reduce((sum, item) => sum + Number(item.amount), 0);
      const totalCompanies = (await this.CompanyService.findAllCompanies())
        .length;
      const totalSubscriptions = (
        await this.SubscriptionService.fetchSubscriptions()
      ).length;

      const totalManagers = (await this.ManagerService.getAllManagers()).length;
      const totalUseraccounts = (await this.UserService.getUsers()).length;
      const totalOwners = (await this.OwnerService.getOwners()).length;
      const totalUsers = totalManagers + totalUseraccounts + totalOwners;

      const latestSubscribers = (await this.SubscriberService.fetchAll()).slice(
        0,
        5
      );

      const topSubscriptions = await Subscription.find().sort().limit(5);

      const payload = {
        totalRevenue,
        totalCompanies,
        totalSubscriptions,
        totalUsers,
        latestSubscribers,
        topSubscriptions,
      };

      sendResponse(res, 200, "succesfully fetched the dashboard data", payload);
    }
  );
}

export default new AdminController(
  AdminService,
  OwnerService,
  ManagerService,
  UserService,
  TransactionService,
  SubscriptionService,
  SubscriberService,
  CompanyService
);
