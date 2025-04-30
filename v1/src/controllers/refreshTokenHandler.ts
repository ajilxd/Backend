import { Request, Response } from "express";
import { JwtPayload } from "jsonwebtoken";
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
import { logger } from "../utils/logger";
import { Manager } from "../schemas/managerSchema";
import { Owner } from "../schemas/ownerSchema";

interface TokenUser extends JwtPayload {
  id: string;
  email: string;
  role: ["user", "admin", "manager", "owner"];
}

export const refreshTokenHandler = function (req: Request, res: Response) {
  const {
    ownerRefreshToken,
    managerRefreshToken,
    userRefreshToken,
    adminRefreshToken,
  } = req.cookies;

  if (ownerRefreshToken) {
    const user = verifyRefreshToken(UserRole.Owner, ownerRefreshToken);
    if (
      !user ||
      typeof user !== "object" ||
      !("id" in user) ||
      !("role" in user)
    ) {
      return sendResponse(
        res,
        errorMap[ErrorType.Forbidden].code,
        "Invalid or expired refresh token"
      );
    }
    Owner.findOne({ refreshToken: ownerRefreshToken }).then((user) => {
      if (!user) {
        return sendResponse(
          res,
          errorMap[ErrorType.Unauthorized].code,
          "Unrecognized token - login again"
        );
      }
      const newAccessToken = generateAccessToken(UserRole.Owner, {
        id: "" + user._id,
        email: user.email,
        role: UserRole.Owner,
      });
      return sendResponse(
        res,
        successMap[SuccessType.Accepted].code,
        "Access token refreshed",
        { accessToken: newAccessToken }
      );
    });
  } else if (managerRefreshToken) {
    const user = verifyRefreshToken(UserRole.Manager, managerRefreshToken);
    if (
      !user ||
      typeof user !== "object" ||
      !("id" in user) ||
      !("role" in user)
    ) {
      return sendResponse(
        res,
        errorMap[ErrorType.Forbidden].code,
        "Invalid or expired refresh token"
      );
    }

    Manager.findOne({ refreshToken: managerRefreshToken }).then((manager) => {
      if (!manager) {
        return sendResponse(
          res,
          errorMap[ErrorType.Unauthorized].code,
          "Unrecognized token - login again"
        );
      }
      const newAccessToken = generateAccessToken(UserRole.Manager, {
        id: "" + manager._id,
        email: manager.email,
        role: UserRole.Manager,
      });
      return sendResponse(
        res,
        successMap[SuccessType.Accepted].code,
        "Access token refreshed",
        { accessToken: newAccessToken }
      );
    });
  } else if (userRefreshToken) {
    const user = verifyRefreshToken(UserRole.User, userRefreshToken);
    if (
      !user ||
      typeof user !== "object" ||
      !("id" in user) ||
      !("role" in user)
    ) {
      return sendResponse(
        res,
        errorMap[ErrorType.Forbidden].code,
        "Invalid or expired refresh token"
      );
    }

    User.findOne({ refreshToken: userRefreshToken }).then((user) => {
      if (!user) {
        return sendResponse(
          res,
          errorMap[ErrorType.Unauthorized].code,
          "Unrecognized token - login again"
        );
      }

      const newAccessToken = generateAccessToken(UserRole.Manager, {
        id: "" + user._id,
        email: user.email,
        role: UserRole.User,
      });
      return sendResponse(
        res,
        successMap[SuccessType.Accepted].code,
        "Access token refreshed",
        { accessToken: newAccessToken }
      );
    });
  } else if (adminRefreshToken) {
    const user = verifyRefreshToken(UserRole.Admin, adminRefreshToken);
    if (
      !user ||
      typeof user !== "object" ||
      !("id" in user) ||
      !("role" in user)
    ) {
      return sendResponse(
        res,
        errorMap[ErrorType.Forbidden].code,
        "Invalid or expired refresh token"
      );
    }

    Admin.findOne({ refreshToken: adminRefreshToken }).then((admin) => {
      if (!admin) {
        return sendResponse(
          res,
          errorMap[ErrorType.Unauthorized].code,
          "Unrecognized token - login again"
        );
      }
      const newAccessToken = generateAccessToken(UserRole.Manager, {
        id: "" + admin._id,
        email: admin.email,
        role: UserRole.Admin,
      });
      return sendResponse(
        res,
        successMap[SuccessType.Accepted].code,
        "Access token refreshed",
        { accessToken: newAccessToken }
      );
    });
  } else {
    return sendResponse(
      res,
      errorMap[ErrorType.Unauthorized].code,
      "No refresh token found"
    );
  }
};
