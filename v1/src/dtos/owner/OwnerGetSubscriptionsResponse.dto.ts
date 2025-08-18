import { Expose, Transform, Type } from "class-transformer";

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

class SubscriptionDto {
  @Expose()
  points!: number;

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

  @Expose()
  @Transform(({ obj }) => obj._id.toString())
  _id!: string;

  @Expose()
  stripe_monthly_price_id!: string;

  @Expose()
  stripe_yearly_price_id!: string;
}

export class OwnerGetSubscriptionsResponse {
  @Expose()
  @Type(() => SubscriptionDto)
  subscriptions!: SubscriptionDto[];
}
