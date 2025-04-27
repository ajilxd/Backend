import { Request, Response, NextFunction, RequestHandler } from "express";
import { validate } from "class-validator";
import { plainToInstance } from "class-transformer";

export const validateBody = (dtoClass: any): RequestHandler => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const dtoObject = plainToInstance(dtoClass, req.body, {
      excludeExtraneousValues: true,
    });
    console.log(req.body);
    const errors = await validate(dtoObject);
    if (errors.length > 0) {
      res.status(400).json({
        status: "error",
        data: null,
        message: "Validation failed",
        error: {
          errors: errors.map((err) => ({
            property: err.property,
            constraints: err.constraints,
          })),
        },
      });
      console.log(errors);
      return;
    }

    next();
  };
};
