import "express";

declare global {
  namespace Express {
    interface Request {
      validatedQuery?: any;
    }
  }
}

export {};
