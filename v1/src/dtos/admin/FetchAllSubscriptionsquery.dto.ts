import { Transform, Type } from "class-transformer";
import { BaseQuery } from "../helperDtos/BaseQuery.dto";
import { IsString } from "class-validator";

export class FetchAllSubscriptionsqueryDto extends BaseQuery {
  @IsString()
  @Type(() => String)
  @Transform(({ value }) =>
    typeof value === "string" ? value.trim().toLowerCase() : value
  )
  search!: string;

  @IsString()
  status!: string;

  @IsString()
  @Transform(({ value }) =>
    typeof value === "string" ? value.trim().toLowerCase() : value
  )
  billingCycle!: string;
}
