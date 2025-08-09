import { Type, Expose, Transform } from "class-transformer";
import { BasePaginationDto } from "../helperDtos/BasePagination.dto";

class TransactionResponseDTO {
  @Expose()
  customerName!: string;

  @Expose()
  companyName!: string;

  @Expose()
  subscriptionName!: string;

  @Expose()
  status!: "success" | "fail";

  @Expose()
  amount!: number;

  @Expose()
  @Transform(({ value }) =>
    value instanceof Date ? value.toISOString() : value
  )
  createdAt!: string;

  @Expose()
  transactionType!: string;

  @Expose()
  billingCycle!: string;

  @Expose()
  subscriptionId!: string;

  @Expose()
  stripeCustomerId!: string;

  @Expose()
  upgrade!: boolean;

  @Expose()
  isInitial!: string;
}

export class FetchTransactionResponseDTO extends BasePaginationDto {
  @Expose()
  @Type(() => TransactionResponseDTO)
  transactions!: TransactionResponseDTO[];
}
