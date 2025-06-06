import { Request, Response, NextFunction } from "express";

export interface ISpaceController {
  addSpaceHandler(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> | void;

  editSpaceHandler(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> | void;

  addUserHandler(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> | void;

  // editUserHandler(
  //   req: Request,
  //   res: Response,
  //   next: NextFunction
  // ): Promise<void> | void;

  getSpacesByField(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> | void;
}
