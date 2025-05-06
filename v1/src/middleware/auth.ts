import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import config from "../config";
import AppError from "../errors/appError";
import { logger } from "../utils/logger";

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: any; // Adjust to your payload
    }
  }
}

const authMiddleware = (allowedRoles: string[] = []) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;
    console.log("auth header", authHeader);

    if (!authHeader) {
      res.status(401).json({ message: "No token provided" });
      return;
    }

    const token = authHeader.split(" ")[1];

    try {
      if (!config.GENERAL_ACCESS_SECRET) {
        throw new AppError("No jwt secrets found", 500);
      }
      const payload = jwt.verify(token, config.GENERAL_ACCESS_SECRET);
      logger.info("data from accesstoken");
      console.log(payload);
      req.user = payload;

      if (
        allowedRoles.length > 0 &&
        typeof payload === "object" &&
        "role" in payload &&
        !allowedRoles.includes(payload.role)
      ) {
        res.status(403).json({ message: "Access denied" });
        return;
      }

      next();
    } catch (err) {
      res.status(401).json({ message: "Invalid or expired token" });
    }
  };
};

export default authMiddleware;
