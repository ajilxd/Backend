import { IOwner } from "../../entities/IOwner";
import { OwnerSubscriptionDetailsType } from "../../types";

export interface IOwnerService {
  createOwner(ownerData: any): Promise<IOwner>;
  checkOwner(email: string, password: string): Promise<IOwner>;
  findOwnerByEmail(email: string): Promise<IOwner | null>;
  resetPassword(email: string, password: string): Promise<IOwner>;
  getOwners(): Promise<IOwner[]>;
  updateOwnerStatus(id: string): Promise<IOwner>;
  updateOwner(id: string, ownerData: Partial<IOwner>): Promise<IOwner>;
  authenticateOwner(
    email: string,
    password?: string,
    isGoogleLogin?: boolean
  ): Promise<{ accessToken: string; refreshToken: string }>;
  fetchOwnerSubscription(
    ownerId: string
  ): Promise<OwnerSubscriptionDetailsType>;

  fetchOwnerById(id: string): Promise<IOwner | null>;
}
