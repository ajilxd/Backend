import { Request, Response, NextFunction } from "express";
import { IUserService } from "../../services/interface/IUserService";
import { IUserController } from "../interface/IUserController";
import { catchAsync } from "../../errors/catchAsyc";
import { successMap, SuccessType } from "../../constants/response.succesful";
import { sendResponse } from "../../utils/sendResponse";
import UserService from "../../services/implementation/UserService";
import AppError from "../../errors/appError";
import mongoose from "mongoose";
import { errorMap, ErrorType } from "../../constants/response.failture";

class UserController implements IUserController {
  private UserService;
  constructor(UserService: IUserService) {
    this.UserService = UserService;
  }

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

  updateUserHandler = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { userId } = req.body;
      if (!userId) {
        throw new AppError("No user id found", 400);
      }
      const updated = await this.UserService.updateUser(userId, req.body);
      if (updated) {
        return sendResponse(res, 201, "updation went succesfull", updated);
      } else {
        throw new AppError("Internal server error", 500);
      }
    }
  );

  getUsersByFieldHandler = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      let { field, value } = req.query;
      console.log(req.query);
      if (typeof field !== "string" || typeof value !== "string") {
        throw new AppError(
          errorMap[ErrorType.BadRequest].message,
          errorMap[ErrorType.BadRequest].code
        );
      }
      const allowedFields = ["spaces", "_id", "creatorId"];
      if (!allowedFields.includes("" + field)) {
        throw new AppError("Invalid query", 400);
      }

      const query: Record<string, mongoose.Types.ObjectId> = {};
      query[field] = new mongoose.Types.ObjectId(value);

      const result = await this.UserService.getUsersQuery(query);

      if (result) {
        return sendResponse(res, 200, "fetched users succesfully", result);
      } else {
        throw new AppError("No users found", 404);
      }
    }
  );
}

export default new UserController(UserService);
