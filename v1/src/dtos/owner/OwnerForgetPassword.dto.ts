import { Transform } from "class-transformer";
import { IsEmail } from "class-validator";

export class OwnerForgetpassword {
  @Transform(({ value }) => value?.toLowerCase().trim())
  @IsEmail()
  email!: string;
}
