export enum ErrorType {
  Unauthorized = "unauthorized",
  NotFound = "notFound",
  ServerError = "serverError",
  BadRequest = "badRequest",
  Forbidden = "forbidden",
  ValidationError = "validationError",
  conflict = "conflict",
}

export const errorMap: Record<ErrorType, { code: number; message: string }> = {
  [ErrorType.Unauthorized]: {
    code: 401,
    message: "Unauthorized action",
  },
  [ErrorType.NotFound]: {
    code: 404,
    message: "Resource not found",
  },
  [ErrorType.ServerError]: {
    code: 500,
    message: "Internal server error",
  },
  [ErrorType.BadRequest]: {
    code: 400,
    message: "Bad request. Check the request format and parameters.",
  },
  [ErrorType.Forbidden]: {
    code: 403,
    message: "You do not have permission to perform this action.",
  },
  [ErrorType.ValidationError]: {
    code: 422,
    message: "Validation error. Please provide valid input.",
  },
  [ErrorType.conflict]: {
    code: 409,
    message: "Duplicate unique fields found",
  },
};
