import { IsEmail, IsString } from "class-validator";

export class OwnerGetByFieldquery {
  @IsString()
  field!: string;

  @IsString()
  value!: string;
}
