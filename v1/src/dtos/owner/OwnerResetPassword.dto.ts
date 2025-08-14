import { Transform } from "class-transformer";
import { IsEmail, IsString } from "class-validator";

export class OwnerResetPassword {
  @Transform(({ value }) => value?.toLowerCase().trim())
  @IsEmail()
  email!: string;

  @IsString()
  password!: string;

  @IsString()
  token!: string;
}
