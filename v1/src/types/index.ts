import { Request, Response, NextFunction } from "express";

export interface IAsyncHandler {
  (req: Request, res: Response, next: NextFunction): Promise<void>;
}

export interface ICatchAsync {
  (fn: IAsyncHandler): (
    req: Request,
    res: Response,
    next: NextFunction
  ) => void;
}
export interface iconfig<T> {
  PORT?: number;
  JWT_SECRET_KEY?: T;
  MONGODB_URI?: T;
  NODE_ENV?: T;
  CLIENT_PORT?: number;
  STRIPE_SECRET_KEY?: T;
  STRIPE_PUBLIC_KEY?: T;
  STRIPE_WEBHOOK_SECRET_KEY?: T;
  ADMIN_ACCESS_SECRET?: T;
  ADMIN_REFRESH_SECRET?: T;
  GENERAL_ACCESS_SECRET?: T;
  GENERAL_REFRESH_SECRET?: T;
}

export type OwnerSubscriptionDetailsType = {
  name?: string;
  isActive?: boolean;
  billingCycle?: string;
  stripe_subscription_id?: string;
  subscription_id?: string;
  next_invoice?: Date;
  cancel_at?: Date;
  canceled_at?: Date;
  created?: Date;
  features?: Array<string>;
  amount?: string;
};

//Types for spaces

export type SpaceQueryType = {
  owner?: string;
  _id?: string;
  companyId?: string;
  managers?: string;
};

export type updateSpaceByQueryType = {
  status?: string;
  visibility?: string;
  managers?: string;
};
