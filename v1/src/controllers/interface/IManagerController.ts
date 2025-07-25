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

  getNotificationsHandler: (
    req: Request,
    res: Response,
    next: NextFunction
  ) => Promise<void> | void;

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
