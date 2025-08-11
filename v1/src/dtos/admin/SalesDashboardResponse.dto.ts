import { Expose, Type } from "class-transformer";

class YearlyReportDto {
  @Expose()
  month!: string;

  @Expose()
  sales!: number;

  @Expose()
  revenue!: number;

  @Expose()
  newCustomers!: number;
}

class SubscriptionSales {
  @Expose()
  _id!: string;
  @Expose()
  count!: string;
}

export class SalesReportResponseDto {
  @Expose()
  churnRate!: number;
  @Expose()
  lostCustomersCount!: number;
  @Expose()
  activeCustomersCount!: number;
  @Expose()
  totalRevenue!: number;
  @Expose()
  upgradeCount!: number;
  @Expose()
  failedPaymentsCount!: number;
  @Expose()
  @Type(() => YearlyReportDto)
  yearlyReport!: YearlyReportDto[];
  @Expose()
  @Type(() => SubscriptionSales)
  subscriptionSalesData!: SubscriptionSales[];
}
