import { NextFunction, Request, Response } from "express";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";

export function validateQuery(DTOClass: any) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const queryInstance = plainToInstance(DTOClass, req.query) as object;

    const errors = await validate(queryInstance, {
      whitelist: true,
      forbidNonWhitelisted: true,
    });

    if (errors.length > 0) {
      res.status(400).json({
        message: "Query validation failed",
        errors: errors.map((error) => ({
          property: error.property,
          constraints: error.constraints,
        })),
      });
      return;
    }

    req.validatedQuery = queryInstance;
    next();
  };
}
