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

class OwnerSubscriptionDto {
  @Expose()
  name!: string;

  @Expose()
  subscriptionId!: string;

  @Expose()
  billingCycle!: string;

  @Expose()
  @Transform(({ value }) =>
    value instanceof Date ? value.toISOString() : value
  )
  expiresAt!: string;

  @Expose()
  amount!: string;

  @Expose()
  status!: string;

  @Expose()
  @Type(() => FeatureDto)
  features!: FeatureDto;
}

export class ownerLoginResponseDto {
  @Expose()
  email!: string;

  @Expose()
  name!: string;

  @Expose()
  @Transform(({ obj }) => obj._id.toString())
  _id!: string;

  @Expose()
  stripe_customer_id!: string;

  @Expose()
  @Type(() => OwnerSubscriptionDto)
  @Transform(({ value }) => (value === null ? null : value))
  subscription!: OwnerSubscriptionDto | null;

  @Expose()
  accessToken!: string;

  @Expose()
  companyId!: string;

  @Expose()
  companyName!: string;

  @Expose()
  bio!: string;

  @Expose()
  image!: string;

  @Expose()
  @Transform(({ value }) =>
    value instanceof Date ? value.toISOString() : value
  )
  createdAt!: string;
}
