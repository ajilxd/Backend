import { IsInt, IsString } from "class-validator";
import { Transform, Type } from "class-transformer";
import { BaseQuery } from "../helperDtos/BaseQuery.dto";

export class FetchAllSubscribersQueryDTO extends BaseQuery {
  @IsString()
  @Type(() => String)
  @Transform(({ value }) =>
    typeof value === "string" ? value.trim().toLowerCase() : value
  )
  search!: string;

  @IsString()
  @Type(() => String)
  status!: string;
}
