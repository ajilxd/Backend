import { Expose, Transform, Type } from "class-transformer";
import { BasePaginationDto } from "../helperDtos/BasePagination.dto";

class SubscriberDto {
  @Expose()
  customerName!: string;

  @Expose()
  company!: string;

  @Expose()
  name!: string;

  @Expose()
  status!: string;

  @Expose()
  amount!: string;

  @Expose()
  @Transform(({ value }) =>
    value instanceof Date ? value.toDateString() : value
  )
  expiresAt!: string;

  @Expose()
  billingCycle!: string;
}

export class SubscriberResponseDto extends BasePaginationDto {
  @Expose()
  @Type(() => SubscriberDto)
  subscribers!: SubscriberDto[];
}
