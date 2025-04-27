import jwt from "jsonwebtoken";
import config from "../config";

type tokenUser = {
  id: string;
  email: string;
  role: ["user", "admin", "manager", "owner"];
};

const ADMIN_ACCESS_SECRET = config.ADMIN_ACCESS_SECRET;
const ADMIN_REFRESH_SECRET = config.ADMIN_REFRESH_SECRET;

export function generateAccessToken(user: tokenUser) {
  if (!ADMIN_ACCESS_SECRET) throw new Error("No admin access secret");
  return jwt.sign(user, ADMIN_ACCESS_SECRET, { expiresIn: "15m" });
}

export function verifyRefreshToken(token: string) {
  try {
    if (!ADMIN_REFRESH_SECRET) throw new Error("NO admin refresh secret");
    const payload = jwt.verify(token, ADMIN_REFRESH_SECRET);
    if (typeof payload == "string") throw new Error("Invalid JWT token");
    return payload;
  } catch (err) {
    return null;
  }
}
