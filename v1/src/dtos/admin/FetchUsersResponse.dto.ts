import { Type, Expose, Transform } from "class-transformer";
import { BasePaginationDto } from "../helperDtos/BasePagination.dto";

class UserResponseDTO {
  @Expose()
  role!: "user" | "manager" | "owner";

  @Expose()
  name!: string;

  @Expose()
  userId!: string;

  @Expose()
  status!: "active" | "inactive";

  @Expose()
  company!: string;

  @Expose()
  @Transform(({ value }) =>
    value instanceof Date ? value.toISOString() : value
  )
  joinedAt!: string;

  @Expose()
  image!: string;
}

export class FetchUserResponseDTO extends BasePaginationDto {
  @Expose()
  @Type(() => UserResponseDTO)
  users!: UserResponseDTO[];
}
