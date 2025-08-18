import { Type } from "class-transformer";
import { IsBoolean, IsNumber, IsString, ValidateNested } from "class-validator";

class FeatureDto {
  @IsNumber()
  managerCount!: number;
  @IsNumber()
  userCount!: number;
  @IsBoolean()
  chat!: boolean;
  @IsBoolean()
  meeting!: boolean;
  @IsNumber()
  spaces!: number;
}

export class UpdateSubscription {
  @IsString()
  name!: string;

  @IsString()
  description!: string;

  @ValidateNested()
  @Type(() => FeatureDto)
  features!: FeatureDto;
}
