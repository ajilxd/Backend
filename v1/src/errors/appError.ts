import config from "../config";

class AppError extends Error {
  statusCode: number;
  status: string;
  isOperational: boolean;
  originalError?: Error;

  constructor(message: string, statusCode: number, originalError?: Error) {
    super(message);

    this.statusCode = statusCode;
    this.status = statusCode >= 400 && statusCode < 500 ? "fail" : "error";
    this.isOperational = true;
    this.originalError = originalError;

    if (config.NODE_ENV === "development") {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export default AppError;
