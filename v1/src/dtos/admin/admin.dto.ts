import "reflect-metadata";

import { IsEmail, IsString, Length } from "class-validator";
import { Expose } from "class-transformer";

export class AdminLoginDto {
  @Expose()
  @IsEmail()
  email!: string;

  @Expose()
  @IsString()
  @Length(6, 20)
  password!: string;
}
