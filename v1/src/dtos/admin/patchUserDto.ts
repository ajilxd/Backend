import { IsBoolean, IsString } from "class-validator";

export class PatchUserDTO {
  @IsString()
  role!: string;

  @IsString()
  id!: string;

  @IsBoolean()
  block!: boolean;
}
