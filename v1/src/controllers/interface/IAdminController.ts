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

  fetchAllusersHandler: (
    req: Request,
    res: Response,
    next: NextFunction
  ) => Promise<void> | void;

  BlockUser: (
    req: Request,
    res: Response,
    next: NextFunction
  ) => Promise<void> | void;

  fetchAllTransactions: (
    req: Request,
    res: Response,
    next: NextFunction
  ) => Promise<void> | void;

  fetchAllSubscriptions: (
    req: Request,
    res: Response,
    next: NextFunction
  ) => Promise<void> | void;

  fetchSalesReport: (
    req: Request,
    res: Response,
    next: NextFunction
  ) => Promise<void> | void;

  fetchAllSubscribers: (
    req: Request,
    res: Response,
    next: NextFunction
  ) => Promise<void> | void;

  fetchDashboard: (
    req: Request,
    res: Response,
    next: NextFunction
  ) => Promise<void> | void;
}
