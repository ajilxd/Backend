import { Type } from "class-transformer";
import { IsString, ValidateNested } from "class-validator";

class Manager {
  @IsString()
  managerId!: string;
}

export class OwnerEditSpace {
  @IsString()
  name!: string;

  @IsString()
  description!: string;

  @IsString()
  spaceId!: string;

  @IsString()
  status!: string;

  @ValidateNested({ each: true })
  @Type(() => Manager)
  managers!: Manager[];
}
