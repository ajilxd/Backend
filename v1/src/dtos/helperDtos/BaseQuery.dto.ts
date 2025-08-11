import { Type } from "class-transformer";
import { IsInt } from "class-validator";

export class BaseQuery {
  @IsInt()
  @Type(() => Number)
  page!: number;

  @IsInt()
  @Type(() => Number)
  itemPerPage!: number;
}
