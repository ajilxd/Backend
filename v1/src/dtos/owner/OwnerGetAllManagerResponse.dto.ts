import { Expose, Type } from "class-transformer";
import { AccountResponse } from "../helperDtos/AccountResponse.dto";

export class OwnerGetAllManagerResponse {
  @Expose()
  @Type(() => AccountResponse)
  managers!: AccountResponse[];
}
