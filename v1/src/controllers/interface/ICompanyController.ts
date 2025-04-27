import { NextFunction, Request, Response } from "express";

export interface ICompanyController {
  registerCompanyHandler(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> | void;

  updateCompanyHandler(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> | void;

  fetchAllCompaniesHandler(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> | void;

  getCompanyHandler(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> | void;
}
