import { Type, Expose, Transform } from "class-transformer";

class TransactionResponseDTO {
  @Expose()
  customerName!: string;

  @Expose()
  companyName!: string;

  @Expose()
  status!: "success" | "fail";

  @Expose()
  subscriptionName!: string;

  @Expose()
  amount!: number;

  @Expose()
  @Transform(({ value }) =>
    value instanceof Date ? value.toISOString() : value
  )
  createdAt!: string;

  @Expose()
  transactionType!: string;
}

export class FetchUserResponseDTO {
  @Expose()
  @Type(() => TransactionResponseDTO)
  transactions!: TransactionResponseDTO[];

  @Expose()
  totalPage!: number;
}
