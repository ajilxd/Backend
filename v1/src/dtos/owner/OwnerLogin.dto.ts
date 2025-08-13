import { Transform } from "class-transformer";
import { IsEmail, IsString } from "class-validator";

export class OwnerLoginDto {
  @Transform(({ value }) => value?.toLowerCase().trim())
  @IsEmail()
  email!: string;

  @IsString()
  password!: string;
}
