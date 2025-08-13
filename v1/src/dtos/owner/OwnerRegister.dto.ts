import { Transform } from "class-transformer";
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MinLength,
} from "class-validator";

export class OwnerRegister {
  @Transform(({ value }) => value?.toLowerCase().trim())
  @IsEmail()
  email!: string;

  @IsString()
  @Transform(({ value }) => value.trim())
  @IsNotEmpty({ message: "Name cannot be empty" })
  @Matches(/\S/, { message: "Name cannot be only spaces" })
  name!: string;

  @IsString()
  @Transform(({ value }) => value.trim())
  @IsNotEmpty({ message: "Name cannot be empty" })
  @Matches(/\S/, { message: "Name cannot be only spaces" })
  @MinLength(6, { message: "Password must be at least 6 characters long" })
  password!: string;
}
