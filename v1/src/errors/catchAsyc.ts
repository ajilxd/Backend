import { Request, Response, NextFunction } from "express";

export const catchAsync =
  (fn: any) =>
  (req: Request, res: Response, next: NextFunction): Promise<void> | void => {
    fn(req, res, next).catch(next);
  };
