import { IsInt, IsOptional, IsString } from "class-validator";
import { Type } from "class-transformer";
import { BaseQuery } from "../helperDtos/BaseQuery.dto";

export class FetchUserQueryDTO extends BaseQuery {
  @IsString()
  @Type(() => String)
  search?: string;

  @IsString()
  @Type(() => String)
  status?: string;

  @IsString()
  @Type(() => String)
  role?: string;
}
