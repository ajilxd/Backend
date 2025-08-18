import { Expose } from "class-transformer";

export class AccountResponse {
  @Expose()
  name!: string;

  @Expose()
  email!: string;

  @Expose()
  role!: string;

  @Expose()
  companyName!: string;

  @Expose()
  companyId!: string;

  @Expose()
  isBlocked!: string;
}
