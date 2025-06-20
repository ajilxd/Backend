import { Request, Response, NextFunction } from "express";
import { IUserService } from "../../services/interface/IUserService";
import { IUserController } from "../interface/IUserController";
import { catchAsync } from "../../errors/catchAsyc";
import { sendResponse } from "../../utils/sendResponse";
import UserService from "../../services/implementation/UserService";
import AppError from "../../errors/appError";
import mongoose from "mongoose";

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
}

export default new UserController(UserService);
