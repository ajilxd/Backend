import "reflect-metadata";

import { IsEmail, IsString } from "class-validator";
import { Expose } from "class-transformer";
import { OwnerSubscriptionDetailsType } from "../../types";

export class ownerGoogleLoginDto {
  @Expose()
  @IsEmail()
  email!: string;
}

export class ownerLoginResponseDto {
  @Expose()
  email!: string;

  @Expose()
  _id!: string;

  @Expose()
  stripe_customer_id!: string;

  @Expose()
  subscription!: OwnerSubscriptionDetailsType;
}

export class ownerOtpVerficationDto {
  @Expose()
  @IsEmail()
  email!: string;

  @Expose()
  @IsString()
  otp!: string;
}

export class ownerSendOtpDto {
  @Expose()
  @IsEmail()
  email!: string;
}
