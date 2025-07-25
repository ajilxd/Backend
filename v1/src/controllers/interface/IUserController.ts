import { Request, Response, NextFunction } from "express";

export interface IUserController {
  logoutHandler(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> | void;

  getUsersByFieldHandler(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> | void;

  updateUserHandler(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> | void;

  getNotificationsHandler(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> | void;
  getChatsHandler: (
    req: Request,
    res: Response,
    next: NextFunction
  ) => Promise<void> | void;

  getMessagesHandler: (
    req: Request,
    res: Response,
    next: NextFunction
  ) => Promise<void> | void;

  getCalendarEventsHandler: (
    req: Request,
    res: Response,
    next: NextFunction
  ) => Promise<void> | void;

  fetchDashboardHandler: (
    req: Request,
    res: Response,
    next: NextFunction
  ) => Promise<void> | void;
}
