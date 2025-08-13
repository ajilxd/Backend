import { Transform } from "class-transformer";
import { IsEmail, IsString } from "class-validator";

export class OwnerOtpVerfication {
  @Transform(({ value }) => value?.toLowerCase().trim())
  @IsEmail()
  email!: string;

  @IsString()
  otp!: string;
}
