import { Request, Response, NextFunction } from "express";

export interface IAuthController {
  sendOtp(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> | void;
  login(req: Request, res: Response, next: NextFunction): Promise<void> | void;
  logout(req: Request, res: Response, next: NextFunction): Promise<void> | void;
}
