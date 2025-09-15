import { Request, Response, NextFunction } from "express";

export interface IOwnerController {
  registerOwner(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> | void;

  authenticateOtp(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> | void;

  loginUser(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> | void;

  logoutUser(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> | void;

  resendOtp(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> | void;

  handleGoogleClick(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> | void;

  forgotPassword(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> | void;

  addManager(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> | void;

  showSubscriptions(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> | void;

  fetchOwner(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> | void;

  fetchOwnerInvoices(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> | void;

  updateProfile: (
    req: Request,
    res: Response,
    next: NextFunction
  ) => Promise<void> | void;

  requestOtp: (
    req: Request,
    res: Response,
    next: NextFunction
  ) => Promise<void> | void;

  editManager: (
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
