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

export class OwnerSubscriptionResponse {
  @Expose()
  @Transform(({ value }) =>
    value instanceof Date ? value.toISOString() : value
  )
  createdAt!: string;

  @Expose()
  @Transform(({ value }) =>
    value instanceof Date ? value.toISOString() : value
  )
  expiresAt!: string;

  @Expose()
  amount!: number;

  @Expose()
  points!: number;

  @Expose()
  status!: string;

  @Expose()
  @Type(() => FeatureDto)
  features!: FeatureDto;

  @Expose()
  billingCycle!: string;

  @Expose()
  name!: string;
}
