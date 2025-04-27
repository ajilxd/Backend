import { Request, Response, NextFunction } from "express";

export interface IUserController {
  logoutHandler(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> | void;
}
