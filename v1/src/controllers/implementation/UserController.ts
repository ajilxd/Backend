import { Request, Response, NextFunction } from "express";
import { IUserService } from "../../services/interface/IUserService";
import { IUserController } from "../interface/IUserController";
import { catchAsync } from "../../errors/catchAsyc";
import { successMap, SuccessType } from "../../constants/response.succesful";
import { sendResponse } from "../../utils/sendResponse";
import UserService from "../../services/implementation/UserService";

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
}

export default new UserController(UserService);
