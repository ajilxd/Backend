import { Request, Response, NextFunction } from "express";
import { ISpaceService } from "../../services/interface/ISpaceService";
import { ISpaceController } from "../interface/ISpaceController";

import AppError from "../../errors/appError";
import { errorMap, ErrorType } from "../../constants/response.failture";
import { SpaceStatus } from "../../entities/ISpace";
import SpaceService from "../../services/implementation/SpaceService";
import { sendResponse } from "../../utils/sendResponse";
import { catchAsync } from "../../errors/catchAsyc";
import { IUserService } from "../../services/interface/IUserService";
import UserService from "../../services/implementation/UserService";
import { logger } from "../../utils/logger";

import mongoose from "mongoose";
import { Space } from "../../schemas/spaceSchema";

class SpaceController implements ISpaceController {
  private SpaceService: ISpaceService;
  private UserService: IUserService;
  constructor(SpaceService: ISpaceService, UserService: IUserService) {
    this.SpaceService = SpaceService;
    this.UserService = UserService;
  }

  addSpaceHandler = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { ownerId, companyName } = req.body;
      if (!ownerId) {
        throw new AppError("No managerId found", 404);
      }
      const companies = await Space.find();
      const samenameComp = companies.filter(
        (i) => i.companyName === companyName
      );
      const existingCompanyname = await Space.findOne({ companyName });
      console.log(existingCompanyname);
      if (existingCompanyname || samenameComp.length > 0) {
        // return sendResponse(res, 400, "existing company name");
        throw new AppError("duplicates found- company name", 400);
      }
      const data = await this.SpaceService.createSpace(ownerId, req.body);
      if (data) {
        sendResponse(res, 201, "Space created succesfully", data);
      } else {
        throw new AppError("Failed at adding the space", 500);
      }
    }
  );

  editSpaceHandler = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { ownerId, spaceId, team } = req.body;

      console.log("req body at space controller",req.body)

      if (!ownerId || !spaceId) {
        throw new AppError("No ownerId or spaceId provided", 400);
      }

      const updated = await this.SpaceService.updateSpace(
        ownerId,
        spaceId,
        req.body
      );


      if (updated) {
        sendResponse(res, 200, "Updation went successful", updated);
      } else {
        throw new AppError("Internal server error", 500);
      }
    }
  );

  addUserHandler = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { managerId, spaceId,team } = req.body;
      console.log("req body at add user controller", JSON.stringify(req.body));
      if (!managerId || !spaceId) {
        throw new AppError("No managerId ,SpaceId found", 400);
      }


      const members: any[] = team?.members ?? [];

      if (members.length > 0) {
        await Promise.all(
          members.map(async (item) => {
            try {
              const user = await this.UserService.getUserById(item.userId);
              if (!user.spaces.includes(spaceId)) {
                await this.UserService.updateUser(item.userId, {
                  spaces: [...user.spaces, spaceId],
                });
              }
            } catch (err) {
              logger.error(`Failed to update user ${item.userId}:`, err);
            }
          })
        );
      }

      const result = await this.SpaceService.addMember(
        spaceId,
        managerId,
       team.members
      );

      if (result) {
        sendResponse(res, 200, "Member added succesfully", result);
      } else {
        throw new AppError("Internal server Error", 500);
      }
    }
  );

  editUserHandler = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { managerId, spaceId, memberId } = req.body;
      if (!managerId || !spaceId || !memberId) {
        throw new AppError("No managerId ,SpaceId,memberId found", 400);
      }
      const result = await this.SpaceService.editMember(
        spaceId,
        memberId,
        managerId,
        req.body
      );

      if (result) {
        sendResponse(res, 200, "Member updation went succesfull", result);
      } else {
        throw new AppError("Internal server error", 500);
      }
    }
  );

  getSpacesByField = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      let field = req.query.field;
      const value = req.query.value;

      if (typeof field !== "string" || typeof value !== "string") {
        throw new AppError(
          errorMap[ErrorType.BadRequest].message,
          errorMap[ErrorType.BadRequest].code
        );
      }

      const allowedFields = ["owner", "_id", "companyId", "managers", "userId"];
      if (!allowedFields.includes("" + field)) {
        throw new AppError("Invalid query", 400);
      }
      if (field === "managers") {
        field = "managers.managerId";
      }

      if (field === "userId") {
        field = "team.members.userId";
      }
      const query: Record<string, mongoose.Types.ObjectId> = {};

      query[field] = new mongoose.Types.ObjectId(value);
      console.log("query", query);
      const result = await this.SpaceService.getSpaces(query);
      if (!result) {
        throw new AppError(
          errorMap[ErrorType.ServerError].message,
          errorMap[ErrorType.ServerError].code
        );
      }
      return sendResponse(res, 200, "succesfully fetched spaces ", result);
    }
  );

  updateSpaceByField = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { spaceId } = req.params;
      const { updateType, updateData } = req.body;
      let updated;
      const validSpaceId = await this.SpaceService.getSpaces({ _id: spaceId });
      if (!validSpaceId) {
        throw new AppError("No space found with this id ", 404);
      }

      switch (updateType) {
        case "status":
          if (!updateData.status || !SpaceStatus.includes(updateData.status)) {
            throw new AppError(
              errorMap[ErrorType.BadRequest].message,
              errorMap[ErrorType.BadRequest].code
            );
          }
          updated = await this.SpaceService.updateSpaceQuery(
            spaceId,
            updateData
          );
          break;
        default:
          throw new AppError("Invalid update Type", 400);
      }
      if (updated) {
        return sendResponse(
          res,
          200,
          "Task status updated succesfully",
          updated
        );
      } else {
        throw new AppError("Failed updating Task on field " + updateType, 500);
      }
    }
  );
}

export default new SpaceController(SpaceService, UserService);
