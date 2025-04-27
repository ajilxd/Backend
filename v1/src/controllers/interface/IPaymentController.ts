import { Request, Response, NextFunction } from "express";

export interface IPaymentController {
  checkoutSessionHandler(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void>;
}
