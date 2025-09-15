import { Expose } from "class-transformer";

export class CompanyResponse {
  @Expose()
  companyName!: string;

  @Expose()
  websiteURL!: string;

  @Expose()
  description!: string;

  @Expose()
  industry!: string[];

  @Expose()
  ownerId!: string;
}
