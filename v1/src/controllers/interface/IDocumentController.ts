import { NextFunction, Request, Response } from "express";

export interface IDocumentController {
  createDocumentHandler(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> | void;

  updateDocumentHandler(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> | void;

  deleteDocumentHandler(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> | void;

  getDocumentsHandler(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> | void;
}
