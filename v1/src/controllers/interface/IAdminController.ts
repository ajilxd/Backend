import { Request, Response, NextFunction } from "express";

export interface IAdminController {
  loginAdmin(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> | void;
}
