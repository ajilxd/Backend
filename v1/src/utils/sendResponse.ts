// utils/response.js
import { Response } from "express";

export const sendResponse = (
  res: Response,
  statusCode: number,
  message?: string | null,
  data?: any,
  error?: any
) => {
  res.status(statusCode).json({
    message,
    data,
    error,
  });
};
