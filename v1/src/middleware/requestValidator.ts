import { Request, Response, NextFunction, RequestHandler } from "express";
import { validate } from "class-validator";
import { plainToInstance } from "class-transformer";

export const validateBody = (dtoClass: any): RequestHandler => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const dtoObject = plainToInstance(dtoClass, req.body);

    const errors = await validate(dtoObject, {
      whitelist: true,
      forbidNonWhitelisted: true,
    });
    if (errors.length > 0) {
      res.status(400).json({
        status: "error",
        data: null,
        message: "Body validation failed",
        error: {
          errors: errors.map((err) => ({
            property: err.property,
            constraints: err.constraints,
          })),
        },
      });
      return;
    }
    req.body = dtoObject;
    next();
  };
};
