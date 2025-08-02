import { IsInt, IsString } from "class-validator";
import { Type } from "class-transformer";

export class FetchTransactionQueryDTO {
  @IsString()
  @Type(() => String)
  search?: string;

  @IsString()
  @Type(() => String)
  status?: string;

  @IsInt()
  @Type(() => Number)
  page?: number;

  @IsInt()
  @Type(() => Number)
  itemPerPage?: number;
}
