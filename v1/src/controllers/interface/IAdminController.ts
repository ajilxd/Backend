import { Request, Response, NextFunction } from "express";

export interface IAdminController {
  loginAdmin(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> | void;

  logoutAdmin: (
    req: Request,
    res: Response,
    next: NextFunction
  ) => Promise<void> | void;

  showOwners: (
    req: Request,
    res: Response,
    next: NextFunction
  ) => Promise<void> | void;

  toggleOwnerStatus: (
    req: Request,
    res: Response,
    next: NextFunction
  ) => Promise<void> | void;

  fetchAllusersHandler: (
    req: Request,
    res: Response,
    next: NextFunction
  ) => Promise<void> | void;
}
