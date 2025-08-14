import { Type } from "class-transformer";
import { IsNumber, IsString } from "class-validator";

class FeatureDto {
  @IsNumber()
  managerCount!: number;
  @IsNumber()
  userCount!: number;
  @IsNumber()
  chat!: boolean;
  @IsNumber()
  meeting!: boolean;
  @IsNumber()
  spaces!: number;
}

export class UpdateSubscription {
  @IsString()
  name!: string;

  @IsString()
  description!: string;

  @Type(() => FeatureDto)
  features!: FeatureDto;
}
