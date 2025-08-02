import { Request, Response, NextFunction } from "express";
import "./types/index";

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
export interface iconfig {
  PORT?: number;
  JWT_SECRET_KEY?: string;
  MONGODB_URI?: string;
  NODE_ENV?: string;
  CLIENT_PORT?: number;
  STRIPE_SECRET_KEY?: string;
  STRIPE_PUBLIC_KEY?: string;
  STRIPE_WEBHOOK_SECRET_KEY?: string;
  GENERAL_ACCESS_SECRET?: string;
  GENERAL_REFRESH_SECRET?: string;
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

type AssigneeType = {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
};

export type EventType = {
  title: string;
  start: Date;
  end: Date;
  id: string;
  assignee?: AssigneeType;
  description?: string;
  status?: string;
  type: "Task" | "meeting";
};

export type AccountType = {
  role: "user" | "manager" | "owner";
  name: string;
  userId: string;
  status: "active" | "inactive";
  company: string;
  joinedAt: Date;
  image: string;
};
