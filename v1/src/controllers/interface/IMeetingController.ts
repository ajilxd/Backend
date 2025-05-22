import { NextFunction, Request, Response } from "express";

export interface IMeetingController {
  addMeetingHandler(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> | void;

  updateMeetingHandler(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> | void;

  fetchMeethingsHandler(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> | void;

  deleteMeetingHandler(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> | void;

  joinMeetingHandler(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> | void;

  leaveMeetingHandler(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> | void;
}
