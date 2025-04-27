import { Request, Response, NextFunction } from "express";

export interface IOwnerController {
  registerOwner(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> | void;

  AuthenticateOtp(
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

  resendOtphandler(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> | void;

  handleGoogleClick(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> | void;

  forgotPasswordHandler(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> | void;

  addManagerHandler(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> | void;

  showSubscriptionsHandler(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> | void;

  showOwnersHandler(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> | void;

  fetchOwnerInvoices(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> | void;
}
