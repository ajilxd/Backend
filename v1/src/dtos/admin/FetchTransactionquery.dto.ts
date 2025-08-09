import { IsInt, IsString } from "class-validator";
import { Type } from "class-transformer";
import { BaseQuery } from "../helperDtos/BaseQuery.dto";

export class FetchTransactionQueryDTO extends BaseQuery {
  @IsString()
  @Type(() => String)
  search!: string;

  @IsString()
  @Type(() => String)
  status!: string;
}
