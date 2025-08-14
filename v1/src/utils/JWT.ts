import jwt from "jsonwebtoken";
import config from "../config";
import AppError from "../errors/appError";
import { Response } from "express";

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

const GENERAL_ACCESS_SECRET = config.GENERAL_ACCESS_SECRET;
const GENERAL_REFRESH_SECRET = config.GENERAL_REFRESH_SECRET;

export function generateAccessToken(type: UserRole, user: tokenUser) {
  if (!GENERAL_ACCESS_SECRET) {
    throw new AppError("No general access secret", 500, "error");
  }
  return jwt.sign(user, GENERAL_ACCESS_SECRET, { expiresIn: "15m" });
}

export function verifyRefreshToken(type: UserRole, token: string) {
  try {
    if (!GENERAL_REFRESH_SECRET)
      throw new AppError("No general refresh secret", 500);
    const payload = jwt.verify(token, GENERAL_REFRESH_SECRET);
    if (typeof payload == "string") throw new Error("Invalid JWT token");
    return payload;
  } catch (err) {
    return null;
  }
}

export function sendCookie(
  res: Response,
  role: "owner" | "manager" | "user" | "admin",
  refreshToken: string
) {
  res.cookie(`${role}RefreshToken`, refreshToken, {
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    secure: config.NODE_ENV === "production",
    sameSite: config.NODE_ENV === "production" ? "none" : "lax",
    path: "/",
  });
}

export function clearCookie(
  res: Response,
  role: "owner" | "manager" | "user" | "admin"
) {
  res.clearCookie(`${role}RefreshToken`, {
    httpOnly: true,
    secure: config.NODE_ENV === "production",
    sameSite: config.NODE_ENV === "production" ? "none" : "lax",
    path: "/",
  });
}
