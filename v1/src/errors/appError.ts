import config from "../config";

type LogLevel = "error" | "warn" ;

class AppError extends Error {
  statusCode: number;
  status: string;
  isOperational: boolean;
  level: LogLevel;          

  constructor(
    message: string,
    statusCode: number,
    level: LogLevel = "error",
  ) {
    super(message);

    this.statusCode = statusCode;
    this.status = statusCode >= 400 && statusCode < 500 ? "fail" : "error";
    this.isOperational = true;
    this.level = level;    
  

    if (config.NODE_ENV === "development") {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export default AppError