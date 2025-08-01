import { Request, Response, NextFunction } from "express";
import { IUserService } from "../../services/interface/IUserService";
import { IUserController } from "../interface/IUserController";
import { catchAsync } from "../../errors/catchAsyc";
import { sendResponse } from "../../utils/sendResponse";
import UserService from "../../services/implementation/UserService";
import AppError from "../../errors/appError";
import mongoose from "mongoose";
import { INotificationService } from "../../services/interface/INotificationService";
import NotificationService from "../../services/implementation/NotificationService";
import { IUserChatService } from "../../services/interface/IUserChatService";
import UserChatService from "../../services/implementation/UserChatService";
import { EventType } from "../../types";
import { ITaskService } from "../../services/interface/ITaskService";
import TaskService from "../../services/implementation/TaskService";
import { ISubscriberService } from "../../services/interface/ISubscriberService";
import SubscriberService from "../../services/implementation/SubscriberService";
import { IOwnerService } from "../../services/interface/IOwnerService";
import OwnerService from "../../services/implementation/OwnerService";
import { stripeInstance } from "../..";
import { ICompanyService } from "../../services/interface/ICompanyService";
import CompanyService from "../../services/implementation/CompanyService";
import { IManagerService } from "../../services/interface/IManagerService";
import ManagerService from "../../services/implementation/ManagerService";

class UserController implements IUserController {
  constructor(
    private UserService: IUserService,
    private NotificationService: INotificationService,
    private UserChatService: IUserChatService,
    private TaskService: ITaskService,
    private SubscriberService: ISubscriberService,
    private OwnerService: IOwnerService,
    private CompanyService: ICompanyService,
    private ManagerService: IManagerService
  ) {}

  logoutHandler = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      res.cookie("ownerRefreshToken", "", {
        httpOnly: true,
        expires: new Date(0),
      });
      return sendResponse(res, 200, "User logout went succesfull");
    }
  );

  updateUserHandler = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { userId } = req.body;
      if (!userId) {
        throw new AppError("No user id found", 400, "warn");
      }
      const modifiedData = req.body;
      if ("ownerId" in modifiedData) {
        delete modifiedData.ownerId;
        delete modifiedData.userId;
      }
      const updated = await this.UserService.updateUser(userId, req.body);

      return sendResponse(
        res,
        200,
        `User(${updated.name}) updation went succesful`,
        updated
      );
    }
  );

  getUsersByFieldHandler = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      let { field, value } = req.query;
      if (typeof field !== "string" || typeof value !== "string") {
        throw new AppError(
          `Bad request - Invalid field (${field}) and value (${value}) `,
          400,
          "warn"
        );
      }
      const allowedFields = ["spaces", "_id"];
      if (!allowedFields.includes("" + field)) {
        throw (
          (new AppError(
            `Bad request - Invalid field (${field}) and value (${value}) `,
            400
          ),
          "warn")
        );
      }

      const query: Record<string, mongoose.Types.ObjectId> = {};
      query[field] = new mongoose.Types.ObjectId(value);

      const result = await this.UserService.getUsersQuery(query);

      return sendResponse(
        res,
        200,
        "Succesfully fetched users succesfully",
        result
      );
    }
  );

  getNotificationsHandler = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      console.log("hey im notification from user side");
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
      const { userId } = req.params;
      if (!userId) {
        throw new AppError("Bad request -userid is required", 400, "warn");
      }
      const query: Record<string, string> = {};
      query["assignee.id"] = userId;
      const Tasks = await this.TaskService.getTasksQuery(query);
      let Events: EventType[] = [];
      if (Tasks.length > 0) {
        Events = Tasks.filter((i) => i.dueDate instanceof Date).map((i) => {
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

      const { userId } = req.query;
      if (typeof userId !== "string") {
        throw new AppError("invalid userId", 400, "warn");
      }
      const objectUserId = new mongoose.Types.ObjectId(userId);
      const userData = await this.UserService.getUserById("" + objectUserId);
      const subscriptionData = await this.SubscriberService.findByCustomerId(
        "" + userData.ownerId
      );

      const ownerData = await this.OwnerService.fetchOwnerById(
        "" + userData.ownerId
      );

      if (!ownerData) {
        throw new AppError("Failed to find the owners data", 404, "warn");
      }

      const stripeSubscriptionData =
        await stripeInstance.subscriptions.retrieve(
          ownerData.subscription?.stripe_subscription_id!
        );

      if (subscriptionData) {
        subscriptionStats.name = subscriptionData.name;
        subscriptionStats.status =
          stripeSubscriptionData.status || subscriptionData.status;
      }

      const companyData = await this.CompanyService.findCompanyByOwnerId(
        "" + ownerData._id
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

      const userTasks = await this.TaskService.getTasksQuery({
        "assignee.id": "" + objectUserId,
      });

      const completedTasks = userTasks.filter(
        (i) => i.status === "done"
      ).length;
      const dueTasks = userTasks.filter((i) => i.dueDate < new Date()).length;
      if (userTasks.length > 0) {
        taskStats.completed = completedTasks;
        taskStats.totalTasks = userTasks.length;
        taskStats.dueTasks = dueTasks;
      }

      const payload = {
        taskStats,
        subscriptionStats,
        companyStats,
      };
      sendResponse(res, 200, "Succesfully fetched the user details", payload);
    }
  );
}

export default new UserController(
  UserService,
  NotificationService,
  UserChatService,
  TaskService,
  SubscriberService,
  OwnerService,
  CompanyService,
  ManagerService
);
