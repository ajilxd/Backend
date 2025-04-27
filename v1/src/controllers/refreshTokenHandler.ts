import { Request, Response } from "express";
import { JwtPayload } from "jsonwebtoken";
import { verifyRefreshToken, generateAccessToken } from "../utils/JWT";
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
  const refreshToken = req.cookies.refreshToken;
  console.log("hey iam form refresh toke handler", req.cookies);

  if (!refreshToken) {
    return sendResponse(
      res,
      errorMap[ErrorType.Unauthorized].code,
      "No refresh token found"
    );
  }
  const user = verifyRefreshToken(refreshToken);

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
  if (user.role == "admin") {
    Admin.findOne({ refreshToken: refreshToken }).then((user) => {
      if (!user) {
        return sendResponse(
          res,
          errorMap[ErrorType.Unauthorized].code,
          "Unrecognized token - login again"
        );
      }
    });
  } else if (user.role == "user") {
    User.findOne({ refreshToken }).then((user) => {
      console.log(user?._id);
      if (!user) {
        return sendResponse(
          res,
          errorMap[ErrorType.Unauthorized].code,
          "Unrecognized token - login again"
        );
      }
    });
  } else if (user.role == "manager") {
    Manager.findOne({ refreshToken }).then((user) => {
      console.log(user?._id);
      if (!user) {
        return sendResponse(
          res,
          errorMap[ErrorType.Unauthorized].code,
          "Unrecognized token - login again"
        );
      }
    });
  } else if (user.role == "owner") {
    Owner.findOne({ refreshToken }).then((user) => {
      console.log(user?._id);
      if (!user) {
        return sendResponse(
          res,
          errorMap[ErrorType.Unauthorized].code,
          "Unrecognized token - login again"
        );
      }
    });
  }

  const newAccessToken = generateAccessToken(user as TokenUser);
  return sendResponse(
    res,
    successMap[SuccessType.Accepted].code,
    "Access token refreshed",
    { accessToken: newAccessToken }
  );
};
