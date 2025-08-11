import { Expose, Type } from "class-transformer";

class LatestSubscribersDto {
  @Expose()
  name!: string;

  @Expose()
  amount!: number;

  @Expose()
  company!: string;

  @Expose()
  customerName!: string;
}

class TopSubscriptionsDto {
  @Expose()
  name!: string;

  @Expose()
  isActive!: boolean;

  @Expose()
  billingCycleType!: string;

  @Expose()
  yearlyAmount!: number;

  @Expose()
  monthlyAmount!: number;
}

export class FetchDashboardDto {
  @Expose()
  totalRevenue!: number;
  @Expose()
  totalCompanies!: number;
  @Expose()
  totalSubscriptions!: number;
  @Expose()
  totalUsers!: number;
  @Expose()
  @Type(() => LatestSubscribersDto)
  latestSubscribers!: LatestSubscribersDto[];
  @Expose()
  @Type(() => TopSubscriptionsDto)
  topSubscriptions!: TopSubscriptionsDto[];
}
