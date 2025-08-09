import { IsBoolean, IsString } from "class-validator";

export class BlockUserDTO {
  @IsString()
  role!: string;

  @IsString()
  id!: string;

  @IsBoolean()
  block!: boolean;
}
