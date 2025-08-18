import { NextFunction, Request, Response } from "express";

export interface ICompanyController {
  registerCompany(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> | void;

  updateCompany(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> | void;

  fetchAllCompanies(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> | void;

  getCompany(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> | void;

  getCompanyMembers: (
    req: Request,
    res: Response,
    next: NextFunction
  ) => Promise<void> | void;
}
