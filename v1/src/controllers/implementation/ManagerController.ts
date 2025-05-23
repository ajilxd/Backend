import { IManagerController } from "../interface/IManagerController";
import ManagerService from "../../services/implementation/ManagerService";
import { IManager } from "../../entities/IManager";

import UserService from "../../services/implementation/UserService";
import { IUserService } from "../../services/interface/IUserService";
import { IManagerService } from "../../services/interface/IManagerService";
import { catchAsync } from "../../errors/catchAsyc";
import { Request, Response, NextFunction } from "express";
import { IUser } from "../../entities/IUser";
import AppError from "../../errors/appError";
import { logger } from "../../utils/logger";
import { sendResponse } from "../../utils/sendResponse";
import { successMap, SuccessType } from "../../constants/response.succesful";
import { IOwnerService } from "../../services/interface/IOwnerService";
import OwnerService from "../../services/implementation/OwnerService";
import { errorMap, ErrorType } from "../../constants/response.failture";
import mongoose from "mongoose";

class managerController implements IManagerController {
  private ManagerService: IManagerService;
  private UserService: IUserService;
  private OwnerService: IOwnerService;

  constructor(
    ManagerService: IManagerService,
    UserService: IUserService,
    OwnerService: IOwnerService
  ) {
    this.ManagerService = ManagerService;
    this.UserService = UserService;
    this.OwnerService = OwnerService;
  }

  updateProfile = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const managerId = req.body.managerId;
      if (!managerId) {
        return res
          .status(400)
          .json({ success: false, data: "Manager id required" });
      }
      const managerData = req.body;
      const updated = await this.ManagerService.updateManager(
        managerId,
        managerData
      );

      res.status(200).json({
        success: true,
        data: { message: "Manager updated successfully" },
      });
      return sendResponse(
        res,
        successMap[SuccessType.Ok].code,
        successMap[SuccessType.Ok].message,
        updated
      );
    }
  );

  addUser = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { managerId } = req.body;
      console.log("req.body at add user", req.body);
      const manager = await this.ManagerService.findManagerById(managerId);
      const owner = await this.OwnerService.fetchOwnerById(
        "" + manager.ownerId
      );
      if (!manager) {
        return res
          .status(400)
          .json({ success: false, data: "Manager not found" });
      }
      if (!owner) {
        return res
          .status(400)
          .json({ success: false, data: "Owner data not found" });
      }

      if (manager && owner) {
        const user = await this.UserService.create({
          ...req.body,
          ownerId: owner._id,
          companyId: manager.companyId,
        });
        return res.status(200).json({ success: true, data: user });
      }
    }
  );

  getUsersByManager = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const managerId = req.params.id as string;

      const manager = await this.ManagerService.findManagerById(managerId);
      if (!manager) {
        res.status(400).json({ success: false, data: "Manager not found" });
      } else {
        const users: any = await this.UserService.getUserByManagerId(managerId);
        if (users && users.length > 0) {
          res.status(200).json({ success: true, data: users });
        } else {
          res.status(201).json({ success: false, data: "No users found" });
        }
      }
    }
  );

  toggleUserStatus = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { managerId } = req.body;
      const userId = req.params.id as string;
      console.log({ userId, managerId });
      if (!managerId || !userId) {
        return res
          .status(400)
          .json({ success: "fail", data: "Manager id and user id required" });
      }

      const manager: IManager | null =
        await this.ManagerService.findManagerById(managerId);
      if (!manager) {
        res.status(400).json({ success: false, data: "Manager not found" });
      } else {
        const userAccount: IUser | null = await this.UserService.getUserById(
          userId
        );

        if (!userAccount) {
          return res
            .status(400)
            .json({ success: false, data: "User not found" });
        }

        if (userAccount.managerId != managerId) {
          return res.status(401).json({ success: false, data: "Unauthorized" });
        }
        if (userAccount) {
          const user = await this.UserService.updateUser(userId, {
            isBlocked: !userAccount.isBlocked,
          });
          console.log(user);
          res
            .status(200)
            .json({ success: true, message: "User status updated" });
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
      return sendResponse(
        res,
        successMap[SuccessType.Ok].code,
        successMap[SuccessType.Ok].message
      );
    }
  );

  getManagersByFieldHandler = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      let { field, value } = req.query;
      if (typeof field !== "string" || typeof value !== "string") {
        throw new AppError(
          errorMap[ErrorType.BadRequest].message,
          errorMap[ErrorType.BadRequest].code
        );
      }
      const allowedFields = ["spaces", "_id"];
      if (!allowedFields.includes("" + field)) {
        throw new AppError("Invalid query", 400);
      }

      const query: Record<string, mongoose.Types.ObjectId> = {};
      query[field] = new mongoose.Types.ObjectId(value);

      const result = await this.ManagerService.getManagersQuery(query);

      if (result) {
        return sendResponse(res, 200, "fetched managers succesfully", result);
      } else {
        throw new AppError("No users found", 404);
      }
    }
  );
}

export default new managerController(ManagerService, UserService, OwnerService);
