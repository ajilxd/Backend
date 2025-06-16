import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger";
import AppError from "./appError";

type ErrorRequestHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => any;

export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";
  err.level = err.level || "error";

  switch (err.level) {
    case "warn":
      logger.warn(`${err.statusCode} - ${err.message}`);

      break;

    case "error":
    default:
      logger.error(err.stack || err.message);
  }

  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }

  if (process.env.NODE_ENV === "development") {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      level: err.level,
      stack: err.stack,
    });
  }

  return res.status(500).json({
    status: "error",
    message: "Something went wrong. Please try again later.",
  });
};
