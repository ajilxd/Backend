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

class UserController implements IUserController {
  private UserService: IUserService;
  private NotificationService: INotificationService;
  constructor(
    UserService: IUserService,
    NotificationService: INotificationService
  ) {
    this.UserService = UserService;
    this.NotificationService = NotificationService;
  }

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
}

export default new UserController(UserService, NotificationService);
