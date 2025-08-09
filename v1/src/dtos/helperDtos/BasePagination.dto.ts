import { Expose } from "class-transformer";

export class BasePaginationDto {
  @Expose()
  totalPage!: number;
}
