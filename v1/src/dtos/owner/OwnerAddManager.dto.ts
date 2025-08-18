import { Transform } from "class-transformer";
import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class OwnerAddManager {
  @Transform(({ value }) => value?.toLowerCase().trim())
  @IsEmail()
  email!: string;

  @IsString()
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : ""))
  @IsNotEmpty({ message: "Name cannot be empty" })
  name!: string;
}
