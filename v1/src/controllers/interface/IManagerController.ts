import { Request, Response, NextFunction } from "express";

export interface IManagerController {
  updateProfile: (
    req: Request,
    res: Response,
    next: NextFunction
  ) => Promise<void> | void;

  addUser: (
    req: Request,
    res: Response,
    next: NextFunction
  ) => Promise<void> | void;

  toggleUserStatus: (
    req: Request,
    res: Response,
    next: NextFunction
  ) => Promise<void> | void;

  getUsersByManager: (
    req: Request,
    res: Response,
    next: NextFunction
  ) => Promise<void> | void;

  logoutHandler: (
    req: Request,
    res: Response,
    next: NextFunction
  ) => Promise<void> | void;
}
