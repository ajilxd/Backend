import { Request, Response, NextFunction } from "express";

export interface ISubscriptionController {
  AddSubscription(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> | void;

  getSubscriptions(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> | void;

  updateSubscription: (
    req: Request,
    res: Response,
    next: NextFunction
  ) => Promise<void> | void;

  updateSubscriptionStatus: (
    req: Request,
    res: Response,
    next: NextFunction
  ) => Promise<void> | void;
}
