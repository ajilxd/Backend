import { Expose, Transform, Type } from "class-transformer";

class CompanyDto {
  @Expose()
  companyName!: string;

  @Expose()
  companyId!: string;
}

export class OwnerGetByFieldResponse {
  @Expose()
  name!: string;

  @Expose()
  email!: string;

  @Expose()
  bio!: string;

  @Expose()
  image!: string;

  @Expose()
  @Type(() => CompanyDto)
  company!: CompanyDto;

  @Expose()
  role!: string;

  @Expose()
  @Transform(({ value }) =>
    value instanceof Date ? value.toISOString() : value
  )
  createdAt!: string;
}
