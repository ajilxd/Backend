import { Transform } from "class-transformer";
import { IsEmail } from "class-validator";

export class ownerSendOtp {
  @Transform(({ value }) => value?.toLowerCase().trim())
  @IsEmail()
  email!: string;
}
