import { Expose, Type } from "class-transformer";

type Industries = string[];

export class CreateCompanyResponse {
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
