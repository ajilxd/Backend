import { IsBoolean, IsNumber, IsString } from "class-validator";

export class AddSubscription {
  @IsBoolean()
  allowChat!: boolean;

  @IsBoolean()
  allowMeeting!: boolean;

  @IsNumber()
  spaceCount!: number;

  @IsNumber()
  managerCount!: number;

  @IsNumber()
  userCount!: number;

  @IsNumber()
  yearlyDiscountPercentage!: number;

  @IsNumber()
  yearlyAmount!: number;

  @IsNumber()
  monthlyAmount!: number;

  @IsString()
  billingCycleType!: string;

  @IsString()
  name!: string;

  @IsString()
  description!: string;
}
