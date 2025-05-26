import { Request, Response } from "express";
import {
  verifyRefreshToken,
  generateAccessToken,
  UserRole,
} from "../utils/JWT";
import { sendResponse } from "../utils/sendResponse";
import { errorMap, ErrorType } from "../constants/response.failture";
import { successMap, SuccessType } from "../constants/response.succesful";

import { Admin } from "../schemas/adminSchema";
import { User } from "../schemas/userSchema";
import { Manager } from "../schemas/managerSchema";
import { Owner } from "../schemas/ownerSchema";

export const refreshTokenHandler = async (req: Request, res: Response) => {
  const role = req.headers["x-user-role"];

  if (!role || typeof role !== "string") {
    return sendResponse(
      res,
      errorMap[ErrorType.BadRequest].code,
      "Role header missing"
    );
  }

  let refreshTokenName: string;
  let model: any;
  let userRole: UserRole;

  switch (role.toLowerCase()) {
    case "owner":
      refreshTokenName = "ownerRefreshToken";
      model = Owner;
      userRole = UserRole.Owner;
      break;
    case "manager":
      refreshTokenName = "managerRefreshToken";
      model = Manager;
      userRole = UserRole.Manager;
      break;
    case "user":
      refreshTokenName = "userRefreshToken";
      model = User;
      userRole = UserRole.User;
      break;
    case "admin":
      refreshTokenName = "adminRefreshToken";
      model = Admin;
      userRole = UserRole.Admin;
      break;
    default:
      return sendResponse(
        res,
        errorMap[ErrorType.BadRequest].code,
        "Invalid user role"
      );
  }

  const refreshToken = req.cookies[refreshTokenName];

  if (!refreshToken) {
    return sendResponse(
      res,
      errorMap[ErrorType.Unauthorized].code,
      "Refresh token not found"
    );
  }

  const user = verifyRefreshToken(userRole, refreshToken);
  if (!user || typeof user !== "object" || !("id" in user)) {
    return sendResponse(
      res,
      errorMap[ErrorType.Forbidden].code,
      "Invalid or expired refresh token"
    );
  }

  const dbUser = await model.findOne({ refreshToken });

  if (!dbUser) {
    return sendResponse(
      res,
      errorMap[ErrorType.Unauthorized].code,
      "Unrecognized token - login again"
    );
  }

  const newAccessToken = generateAccessToken(userRole, {
    id: "" + dbUser._id,
    email: dbUser.email,
    role: userRole,
  });

  return sendResponse(
    res,
    successMap[SuccessType.Accepted].code,
    "Access token refreshed",
    { accessToken: newAccessToken }
  );
};
