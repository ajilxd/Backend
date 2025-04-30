import jwt from "jsonwebtoken";
import config from "../config";
import AppError from "../errors/appError";

export enum UserRole {
  Admin = "admin",
  Owner = "owner",
  User = "user",
  Manager = "manager",
}

type tokenUser = {
  id: string;
  email: string;
  role: UserRole;
};

const ADMIN_ACCESS_SECRET = config.ADMIN_ACCESS_SECRET;
const ADMIN_REFRESH_SECRET = config.ADMIN_REFRESH_SECRET;
const GENERAL_ACCESS_SECRET = config.GENERAL_ACCESS_SECRET;
const GENERAL_REFRESH_SECRET = config.GENERAL_REFRESH_SECRET;

export function generateAccessToken(type: UserRole, user: tokenUser) {
  if (type === UserRole.Admin) {
    if (!ADMIN_ACCESS_SECRET) throw new Error("No admin access secret");
    return jwt.sign(user, ADMIN_ACCESS_SECRET, { expiresIn: "15m" });
  } else {
    if (!GENERAL_ACCESS_SECRET) {
      throw new AppError("No general access secret", 500);
    }
    return jwt.sign(user, GENERAL_ACCESS_SECRET, { expiresIn: "15m" });
  }
}

export function verifyRefreshToken(type: UserRole, token: string) {
  try {
    if (type === UserRole.Admin) {
      if (!ADMIN_REFRESH_SECRET)
        throw new AppError("NO admin refresh secret", 500);
      const payload = jwt.verify(token, ADMIN_REFRESH_SECRET);
      if (typeof payload == "string") throw new Error("Invalid JWT token");
      return payload;
    } else {
      if (!GENERAL_REFRESH_SECRET)
        throw new AppError("No general refresh secret", 500);
      const payload = jwt.verify(token, GENERAL_REFRESH_SECRET);
      if (typeof payload == "string") throw new Error("Invalid JWT token");
      return payload;
    }
  } catch (err) {
    return null;
  }
}
