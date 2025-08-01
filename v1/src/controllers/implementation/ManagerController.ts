import { IManagerController } from "../interface/IManagerController";
import ManagerService from "../../services/implementation/ManagerService";
import UserService from "../../services/implementation/UserService";
import { IUserService } from "../../services/interface/IUserService";
import { IManagerService } from "../../services/interface/IManagerService";
import { catchAsync } from "../../errors/catchAsyc";
import { Request, Response, NextFunction } from "express";
import { IUser } from "../../entities/IUser";
import AppError from "../../errors/appError";
import { sendResponse } from "../../utils/sendResponse";
import { IOwnerService } from "../../services/interface/IOwnerService";
import OwnerService from "../../services/implementation/OwnerService";
import mongoose from "mongoose";
import { INotificationService } from "../../services/interface/INotificationService";
import NotificationService from "../../services/implementation/NotificationService";
import { IUserChatService } from "../../services/interface/IUserChatService";
import UserChatService from "../../services/implementation/UserChatService";
import TaskService from "../../services/implementation/TaskService";
import { ITaskService } from "../../services/interface/ITaskService";
import { EventType } from "../../types";
import { ISubscriberService } from "../../services/interface/ISubscriberService";
import SubscriberService from "../../services/implementation/SubscriberService";
import { stripeInstance } from "../..";
import { ICompanyService } from "../../services/interface/ICompanyService";
import CompanyService from "../../services/implementation/CompanyService";

class managerController implements IManagerController {
  constructor(
    private ManagerService: IManagerService,
    private UserService: IUserService,
    private OwnerService: IOwnerService,
    private NotificationService: INotificationService,
    private UserChatService: IUserChatService,
    private TaskService: ITaskService,
    private SubscriberService: ISubscriberService,
    private CompanyService: ICompanyService
  ) {}

  updateProfile = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const managerId = req.body.managerId;
      if (!managerId) {
        throw new AppError("Manager id required", 400, "warn");
      }
      const managerData = req.body;
      if ("ownerId" in managerData) {
        delete managerData.ownerId;
        delete managerData.userId;
      }
      const updated = await this.ManagerService.updateManager(
        managerId,
        managerData
      );

      return sendResponse(res, 200, "profile updation went succesful", updated);
    }
  );

  addUser = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { managerId, email } = req.body;
      const existingOwner = await this.OwnerService.findOwnerByEmail(email);
      const existingManager = await this.ManagerService.fetchManagerByEmail(
        email
      );
      const existingUser = await this.UserService.findUserByEmail(email);
      if (existingManager || existingOwner || existingUser) {
        return sendResponse(res, 409, "existing email");
      }
      const manager = await this.ManagerService.findManagerById(managerId);
      const owner = await this.OwnerService.fetchOwnerById(
        "" + manager.ownerId
      );
      if (!manager) {
        throw new AppError(
          `No manager Found with the managerId ${managerId}`,
          400,
          "warn"
        );
      }
      if (!owner) {
        throw new AppError(
          `No owner Found with the manager ${managerId}`,
          400,
          "warn"
        );
      }

      if (manager && owner) {
        const user = await this.UserService.create({
          ...req.body,
          ownerId: owner._id,
          companyId: manager.companyId,
          companyName: owner.company.companyName,
        });
        return sendResponse(
          res,
          200,
          `User (${req.body.name}) has beedn added succesfully `,
          user
        );
      }
    }
  );

  getUsersByManager = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const managerId = req.params.id as string;

      const manager = await this.ManagerService.findManagerById(managerId);
      if (!manager) {
        throw new AppError(
          `No manager account found with the managerId - id(${managerId})`,
          404
        );
      } else {
        const users = await this.UserService.getUserByManagerId(managerId);
        if (users && users.length > 0) {
          return sendResponse(res, 200, "Succesfully fetched users", users);
        } else {
          return sendResponse(
            res,
            204,
            `No users found with this managerId ${managerId}`,
            users
          );
        }
      }
    }
  );

  toggleUserStatus = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { managerId } = req.body;
      const userId = req.params.id as string;
      if (!managerId || !userId) {
        throw new AppError("No manager Id or user Id found", 400, "warn");
      }

      const manager = await this.ManagerService.findManagerById(managerId);
      if (!manager) {
        throw new AppError(`No manager account found -id (${managerId})`, 404);
      } else {
        const userAccount: IUser | null = await this.UserService.getUserById(
          userId
        );

        if (!userAccount) {
          throw new AppError(`No user account found -id (${userId})`, 404);
        }

        if (userAccount) {
          const user = await this.UserService.updateUser(userId, {
            isBlocked: !userAccount.isBlocked,
          });

          return sendResponse(
            res,
            200,
            `user (${user.name}) has been blocked succesfully`
          );
        }
      }
    }
  );

  logoutHandler = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      res.cookie("ownerRefreshToken", "", {
        httpOnly: true,
        expires: new Date(0),
      });
      return sendResponse(res, 200, `Log out went succesfull`);
    }
  );

  getManagersByFieldHandler = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      let { field, value } = req.query;
      if (typeof field !== "string" || typeof value !== "string") {
        throw new AppError("bad request", 400, "warn");
      }
      const allowedFields = ["spaces", "_id"];
      if (!allowedFields.includes("" + field)) {
        throw new AppError("Invalid query", 400, "warn");
      }

      const query: Record<string, mongoose.Types.ObjectId> = {};
      query[field] = new mongoose.Types.ObjectId(value);

      const result = await this.ManagerService.getManagersQuery(query);

      if (result) {
        return sendResponse(res, 200, "fetched managers succesfully", result);
      } else {
        throw (new AppError("No users found", 404), "warn");
      }
    }
  );

  getNotificationsHandler = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      console.log("hey im notification");
      const { companyId, receiverId } = req.query;

      if (typeof companyId !== "string") {
        return res
          .status(400)
          .json({ message: "Invalid or missing companyId" });
      }

      if (typeof receiverId !== "string") {
        return res
          .status(400)
          .json({ message: "Invalid or missing receiverId" });
      }

      const notifications = await this.NotificationService.fetchNotifications(
        companyId
      );
      const result = notifications.filter(
        (i) => i.notificationSenderId != receiverId
      );
      if (result.length < 1) {
        return sendResponse(res, 204, "No content");
      }
      sendResponse(res, 200, "notifications fetched succesfully", result);
    }
  );

  getChatsHandler = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { userId } = req.query;
      const chats = await this.UserChatService.findChatsByUserId("" + userId);
      sendResponse(
        res,
        200,
        `Chats fetched succesfully for id ${userId}`,
        chats
      );
    }
  );

  getMessagesHandler = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { chatId } = req.query;
      const messages = await this.UserChatService.findMessageByChatId(
        "" + chatId
      );
      sendResponse(
        res,
        200,
        `${messages.length - 1} messages fetched succesfully`,
        messages
      );
    }
  );

  getCalendarEventsHandler = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { managerId } = req.params;
      const Tasks = await this.TaskService.getTasksQuery({
        creatorId: managerId,
      });
      console.log("Tasks", Tasks);
      let Events: EventType[] = [];
      if (Tasks.length > 0) {
        Events = Tasks.map((i) => {
          return {
            title: i.name,
            start: i.createdAt,
            end: i.dueDate,
            id: "" + i._id,
            assignee: i.assignee,
            description: i.description,
            status: i.status,
            type: "Task",
          };
        });
      }
      sendResponse(res, 200, "Succesfully fetched events", Events);
    }
  );
  fetchDashboardHandler = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      let subscriptionStats = { name: "N/A", status: "N/A" };
      let companyStats = {
        name: "N/A",
        description: "N/A",
        totalUsers: 0,
        owner: "N/A",
      };
      let taskStats = {
        completed: 0,
        totalTasks: 0,
        dueTasks: 0,
      };

      const { managerId } = req.query;
      if (typeof managerId !== "string") {
        throw new AppError("invalid managerId", 400, "warn");
      }
      const objectManagerId = new mongoose.Types.ObjectId(managerId);
      const managerData = await this.ManagerService.findManagerById(
        "" + objectManagerId
      );
      if (!managerData || !managerData.ownerId) {
        throw new AppError("Couldn't find the manger data", 404, "warn");
      }
      const subscriberData = await this.SubscriberService.findByCustomerId(
        "" + managerData.ownerId
      );

      const ownerData = await this.OwnerService.fetchOwnerById(
        "" + managerData.ownerId
      );

      if (!ownerData) {
        throw new AppError("Failed to find the owners data", 404, "warn");
      }

      const stripeSubscriptionData =
        await stripeInstance.subscriptions.retrieve(
          ownerData.subscription?.stripe_subscription_id!
        );
      if (subscriberData) {
        subscriptionStats.name = subscriberData.name;
        subscriptionStats.status =
          stripeSubscriptionData.status || subscriberData.status;
      }

      const companyData = await this.CompanyService.findCompanyByOwnerId(
        "" + managerData.ownerId
      );
      if (companyData) {
        companyStats.description = companyData.description;
        companyStats.name = companyData.companyName;
        companyStats.owner = ownerData.name;
        const companyManagers = (
          await this.ManagerService.getAllManagers()
        ).filter((i) => i.companyId === companyData?._id).length;
        const companyUsers = (await this.UserService.getUsers()).filter(
          (i) => i.companyId === companyData?._id
        ).length;
        companyStats.totalUsers = companyManagers + companyUsers + 1;
      }

      const managerTasks = await this.TaskService.getTasksQuery({
        creatorId: "" + objectManagerId,
      });
      const completedTasks = managerTasks.filter(
        (i) => i.status === "done"
      ).length;
      const dueTasks = managerTasks.filter(
        (i) => i.dueDate < new Date()
      ).length;

      if (managerTasks.length > 0) {
        taskStats.completed = completedTasks;
        taskStats.dueTasks = dueTasks;
        taskStats.totalTasks = managerTasks.length;
      }

      const users = await this.UserService.getUserByManagerId(
        "" + objectManagerId
      );
      const managers = await this.ManagerService.getManagersQuery({
        ownerId: "" + managerData.ownerId,
      });
      console.log(`users of the manager`, users);
      const userData = users.map((i) => {
        return {
          name: i.name,
          role: i.role,
          status: i.isBlocked ? "inactive" : "active",
        };
      });
      let totalUsers = 1 + userData.length + managers.length;

      const payload = {
        taskStats,
        subscriptionStats,
        companyStats,
        userData,
        totalUsers,
      };
      sendResponse(res, 200, "Succesfully fetched manager", payload);
    }
  );
}

export default new managerController(
  ManagerService,
  UserService,
  OwnerService,
  NotificationService,
  UserChatService,
  TaskService,
  SubscriberService,
  CompanyService
);
