import { IOTPRepository } from "../../repositories/interface/IOTPRepository";
import { IOtp } from "../../entities/IOtp";
import AppError from "../../errors/appError";
import { IOTPService } from "../interface/IOTPService";
import OTPRepository from "../../repositories/implementations/OTPRepostiory";
import OwnerRepository from "../../repositories/implementations/OwnerRepository";
import sendEmail from "../../utils/sendMail";
import { errorMap, ErrorType } from "../../constants/response.failture";

import { IOwner } from "../../entities/IOwner";
import { logger } from "../../utils/logger";
import { IOwnerRepository } from "../../repositories/interface/IOwnerRepository";

class OTPService implements IOTPService {
  private OTPRepository: IOTPRepository;
  private OwnerRepository: IOwnerRepository;
  constructor(
    OTPRepository: IOTPRepository,
    OwnerRepository: IOwnerRepository
  ) {
    this.OTPRepository = OTPRepository;
    this.OwnerRepository = OwnerRepository;
  }
  async generateOTP(): Promise<string> {
    const otp = Math.floor(100000 + Math.random() * 900000);
    return otp.toString();
  }

  async sendOTP(email: string): Promise<void> {
    const otp = await this.generateOTP();

    await this.deleteOtp(email);
    const newOtp = await OTPRepository.create({ email, otp });
    if (!newOtp) {
      throw new AppError(
        `Failed creating otp collection for email ${email}`,
        500,
        "error"
      );
    }
    return await sendEmail(
      email,
      "account-verification",
      "account-verification",
      {
        subject: "Account Verification",
        name: "user",
        text: otp,
      }
    );
  }

  async verifyOTP(email: string, otp: string): Promise<IOwner> {
    const otpExists = await this.OTPRepository.findOne({ email });
    if (!otpExists) {
      throw new AppError(`No otp found for this email - ${email}`, 404, "warn");
    }

    if (otpExists.otp !== otp) {
      throw new AppError(`Invalid otp entered by ${email}`, 401);
    }

    await OTPRepository.delete(email);
    const verifiedAccount = await this.OwnerRepository.verifyAccount(email);

    if (!verifiedAccount) {
      throw new AppError("failed to update the owner collection", 500, "error");
    }

    logger.info(`${new Date().toLocaleString()} : Otp verified for, ${email}`);

    return verifiedAccount;
  }

  async deleteOtp(email: string): Promise<any> {
    await this.OTPRepository.delete(email);
  }

  async authOTPverify(email: string, role: string, otp: string) {
    const otpExists = await this.OTPRepository.findOne({ email });
    if (!otpExists) {
      throw new AppError("No otp found", 404);
    }
    logger.info(otpExists.otp, otp);
    await this.deleteOtp(email);
    return otpExists.otp == otp;
  }
}

export default new OTPService(OTPRepository, OwnerRepository);
