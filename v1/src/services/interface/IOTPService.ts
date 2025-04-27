import { IOtp } from "../../entities/IOtp";
import { IOwner } from "../../entities/IOwner";

export interface IOTPService {
  generateOTP(userId: string): Promise<string>;
  sendOTP(email: string): Promise<void>;
  verifyOTP(userId: string, otp: string): Promise<IOwner>;
  deleteOtp(email: string): Promise<IOtp>;
  authOTPverify(email: string, role: string, otp: string): Promise<any>;
}
