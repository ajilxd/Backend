import { Expose, Transform } from "class-transformer";

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

  @Expose()
  @Transform(({ obj }) => obj._id.toString())
  _id!: string;
}
