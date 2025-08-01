import { IsInt, IsOptional, IsString } from "class-validator";
import { Type } from "class-transformer";

export class FetchUserQueryDTO {
  @IsString()
  @Type(() => String)
  search?: string;

  @IsString()
  @Type(() => String)
  status?: string;

  @IsString()
  @Type(() => String)
  role?: string;

  @IsInt()
  @Type(() => Number)
  page?: number;

  @IsInt()
  @Type(() => Number)
  itemPerPage?: number;
}
