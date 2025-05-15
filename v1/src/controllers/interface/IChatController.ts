import { NextFunction, Request, Response } from "express";

export interface IChatController {
  fetchChatsByRoom(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> | void;
}
