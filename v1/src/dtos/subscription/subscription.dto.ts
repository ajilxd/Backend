import "reflect-metadata";

import {
  IsString,
  IsBoolean,
  IsOptional,
  IsArray,
  IsNumber,
} from "class-validator";

export class CreateSubscriptionDto {
  @IsString()
  billingCycle!: string;

  @IsNumber()
  amount!: number;

  @IsString()
  name!: string;

  @IsBoolean()
  isActive!: boolean;

  @IsString()
  description!: string;

  @IsArray()
  @IsString({ each: true })
  features!: string[];
}

export class UpdateSubscriptionDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsString()
  id!: string;

  @IsOptional()
  @IsString()
  billingCycle?: string;

  @IsOptional()
  @IsNumber()
  amount?: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  features?: string[];

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
