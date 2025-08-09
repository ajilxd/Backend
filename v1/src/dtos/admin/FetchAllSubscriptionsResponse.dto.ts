import { Expose, Transform, Type } from "class-transformer";
import { BasePaginationDto } from "../helperDtos/BasePagination.dto";

class FeatureDto {
  @Expose()
  managerCount!: number;
  @Expose()
  userCount!: number;
  @Expose()
  chat!: boolean;
  @Expose()
  meeting!: boolean;
  @Expose()
  spaces!: number;
}

class SubscriptionsDto {
  @Expose()
  name!: string;

  @Expose()
  description!: string;

  @Expose()
  yearlyAmount!: number;

  @Expose()
  monthlyAmount!: number;

  @Expose()
  isActive!: boolean;

  @Expose()
  userCount!: number;

  @Expose()
  billingCycleType!: string;

  @Expose()
  @Type(() => FeatureDto)
  features!: FeatureDto;

  @Expose()
  @Transform(({ value }) =>
    value instanceof Date ? value.toISOString() : value
  )
  createdAt!: string;
}

export class FetchAllSubscriptionsResponseDto extends BasePaginationDto {
  @Expose()
  @Type(() => SubscriptionsDto)
  subscriptions!: SubscriptionsDto[];
}
